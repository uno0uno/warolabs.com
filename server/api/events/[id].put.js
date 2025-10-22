// server/api/events/[id].put.js
// Updated to use expand_complete_event stored procedure for safe event expansion

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { getHeader } from 'h3';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load development mapping
let devSiteMapping = {};
try {
  const projectRoot = process.cwd();
  const mappingPath = join(projectRoot, 'dev-site-mapping.json');
  devSiteMapping = JSON.parse(readFileSync(mappingPath, 'utf8'));
  console.log(`🔧 Dev site mapping loaded for event expansion:`, devSiteMapping);
} catch (error) {
  console.log('🔧 Event expansion: Dev site mapping not found, using production mode');
}

export default defineEventHandler(async (event) => {
  // Auto-detect tenant using same logic as POST endpoint
  const host = getHeader(event, 'host') || '';
  const origin = getHeader(event, 'origin') || '';
  const referer = getHeader(event, 'referer') || '';
  const forwardedHost = getHeader(event, 'x-forwarded-host') || '';
  const originalHost = getHeader(event, 'x-original-host') || '';
  
  console.log(`🔍 Expanding event - headers: host=${host}, origin=${origin}, referer=${referer}`);

  if (event.method !== 'PUT') {
    throw createError({ 
      statusCode: 405, 
      statusMessage: 'Method Not Allowed', 
      message: 'This endpoint only accepts PUT requests.' 
    });
  }

  const eventId = parseInt(event.context.params.id);
  const body = await readBody(event);

  if (isNaN(eventId) || eventId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'El ID del evento debe ser un número entero positivo.'
    });
  }

  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'El cuerpo de la solicitud debe ser un objeto JSON válido.'
    });
  }

  // Validate areas_expansion is provided (main requirement for expansion)
  if (!body.areas_expansion || !Array.isArray(body.areas_expansion) || body.areas_expansion.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Se requiere al menos una expansión de área (areas_expansion) para expandir el evento.'
    });
  }

  console.log(`PUT /api/events/${eventId} - Expanding event with:`, {
    eventId,
    areasCount: body.areas_expansion.length,
    imagesCount: body.images_data ? body.images_data.length : 0
  });

  return await withPostgresClient(async (client) => {
    try {
      // Auto-detect tenant site using same logic as POST endpoint
      let detectedSite = null;
      let potentialSites = [];
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔧 Development mode - checking port mapping for event expansion`);
        
        if (forwardedHost && devSiteMapping[forwardedHost]) {
          console.log(`🔧 Event expansion: Proxy request from: ${forwardedHost} -> ${devSiteMapping[forwardedHost]}`);
          potentialSites = [devSiteMapping[forwardedHost]];
        } else {
          const backendPort = host.split(':')[1] || '4000';
          const backendHost = `localhost:${backendPort}`;
          
          if (devSiteMapping[backendHost]) {
            console.log(`🔧 Event expansion: Direct request to backend: ${backendHost} -> ${devSiteMapping[backendHost]}`);
            potentialSites = [devSiteMapping[backendHost]];
          } else {
            const allSites = [
              host,
              origin?.replace(/^https?:\/\//, ''),
              referer?.replace(/^https?:\/\//, '')?.split('/')[0]
            ].filter(Boolean);
            
            const mappedSites = allSites.map(site => devSiteMapping[site] || site);
            potentialSites = [...new Set(mappedSites)];
          }
        }
      } else {
        potentialSites = [
          forwardedHost,
          originalHost,
          origin?.replace(/^https?:\/\//, ''),
          referer?.replace(/^https?:\/\//, '')?.split('/')[0],
          host
        ].filter(Boolean);
      }
      
      console.log(`🔍 Event expansion: Potential sites to check: ${potentialSites.join(', ')}`);
      
      // Check which site exists in tenant_sites
      for (const site of potentialSites) {
        const result = await client.query(`
          SELECT site FROM tenant_sites 
          WHERE site = $1 AND is_active = true
        `, [site]);
        
        if (result.rows.length > 0) {
          detectedSite = site;
          break;
        }
      }
      
      if (!detectedSite) {
        throw createError({
          statusCode: 404,
          statusMessage: `No tenant found for any of the detected sites: ${potentialSites.join(', ')}`
        });
      }

      console.log(`🏢 Event expansion: Using detected site: ${detectedSite}`);

      // Call the expand_complete_event stored procedure
      const query = `
        SELECT expand_complete_event($1, $2, $3, $4) as result
      `;
      
      const values = [
        eventId,
        detectedSite,
        JSON.stringify(body.areas_expansion),
        body.images_data ? JSON.stringify(body.images_data) : null
      ];

      console.log('Calling expand_complete_event with:', {
        eventId,
        detectedSite,
        areasExpansionCount: body.areas_expansion.length,
        imagesCount: body.images_data ? body.images_data.length : 0
      });

      const result = await client.query(query, values);
      const procedureResult = result.rows[0].result;

      if (!procedureResult.success) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: procedureResult.message || 'Event expansion failed'
        });
      }

      setResponseStatus(event, 200);
      return procedureResult;

    } catch (error) {
      console.error('Error calling expand_complete_event procedure:', error);
      
      // If it's already an HTTP error, re-throw it
      if (error.statusCode) {
        throw error;
      }
      
      // Handle PostgreSQL stored procedure errors
      if (error.message && error.message.includes('Error expanding event:')) {
        const actualError = error.message.replace('Error expanding event: ', '');
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: actualError
        });
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Error interno expandiendo el evento. Por favor intenta nuevamente.'
      });
    }

  }, event);
});