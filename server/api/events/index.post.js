// server/api/events/index.post.js
// Updated to use stored procedure for better transaction handling

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getHeader } from 'h3';

// Load development mapping
let devSiteMapping = {};
try {
  const projectRoot = process.cwd();
  const mappingPath = join(projectRoot, 'dev-site-mapping.json');
  devSiteMapping = JSON.parse(readFileSync(mappingPath, 'utf8'));
  console.log(`🔧 Dev site mapping loaded for events (using stored procedure):`, devSiteMapping);
} catch (error) {
  console.log('🔧 Events: Dev site mapping not found, using production mode');
}

export default defineEventHandler(async (event) => {
  // Auto-detect tenant using same logic as profiles endpoint
  const host = getHeader(event, 'host') || '';
  const origin = getHeader(event, 'origin') || '';
  const referer = getHeader(event, 'referer') || '';
  const forwardedHost = getHeader(event, 'x-forwarded-host') || '';
  const originalHost = getHeader(event, 'x-original-host') || '';
  
  console.log(`🔍 Creating event (via stored procedure) - headers: host=${host}, origin=${origin}, referer=${referer}`);

  if (event.method !== 'POST') {
    throw createError({ 
      statusCode: 405, 
      statusMessage: 'Method Not Allowed', 
      message: 'This endpoint only accepts POST requests.' 
    });
  }

  const body = await readBody(event);
  const { profile_id, event_data, areas_data, legal_info_data, images_data } = body;

  // Basic validations - let the stored procedure handle detailed validations
  if (!profile_id) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Bad Request', 
      message: 'Profile ID (profile_id) is required.' 
    });
  }

  if (!event_data || typeof event_data !== 'object') {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Bad Request', 
      message: 'Event data (event_data) is required and must be an object.' 
    });
  }

  if (!areas_data || !Array.isArray(areas_data) || areas_data.length === 0) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Bad Request', 
      message: 'At least one area (areas_data) is required to create an event.' 
    });
  }

  if (!legal_info_data || typeof legal_info_data !== 'object') {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Bad Request', 
      message: 'Legal information (legal_info_data) is required to create an event.' 
    });
  }

  // Validate UUID format
  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(profile_id)) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Bad Request', 
      message: 'Profile ID (profile_id) has an invalid UUID format.' 
    });
  }

  return await withPostgresClient(async (client) => {
    try {
      // Auto-detect tenant site using same logic as main endpoint
      let detectedSite = null;
      let potentialSites = [];
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔧 Development mode - checking port mapping for events (stored procedure)`);
        
        if (forwardedHost && devSiteMapping[forwardedHost]) {
          console.log(`🔧 Events SP: Proxy request from: ${forwardedHost} -> ${devSiteMapping[forwardedHost]}`);
          potentialSites = [devSiteMapping[forwardedHost]];
        } else {
          const backendPort = host.split(':')[1] || '4000';
          const backendHost = `localhost:${backendPort}`;
          
          if (devSiteMapping[backendHost]) {
            console.log(`🔧 Events SP: Direct request to backend: ${backendHost} -> ${devSiteMapping[backendHost]}`);
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
      
      console.log(`🔍 Events SP: Potential sites to check: ${potentialSites.join(', ')}`);
      
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

      console.log(`🏢 Events SP: Using detected site: ${detectedSite}`);

      // Call the stored procedure
      const query = `
        SELECT create_complete_event($1, $2, $3, $4, $5, $6) as result
      `;
      
      const values = [
        profile_id,
        detectedSite,
        JSON.stringify(event_data),
        JSON.stringify(areas_data),
        JSON.stringify(legal_info_data),
        images_data ? JSON.stringify(images_data) : null
      ];

      console.log('Calling stored procedure with:', {
        profile_id,
        detectedSite,
        event_data,
        areas_count: areas_data.length,
        legal_info_provided: 'yes',
        images_count: images_data ? images_data.length : 0
      });

      const result = await client.query(query, values);
      const procedureResult = result.rows[0].result;

      if (!procedureResult.success) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
          message: procedureResult.message || 'Stored procedure execution failed'
        });
      }

      setResponseStatus(event, 201);
      return procedureResult;

    } catch (error) {
      console.error('Error calling stored procedure from main endpoint:', error);
      
      // If it's already an HTTP error, re-throw it
      if (error.statusCode) {
        throw error;
      }
      
      // Handle PostgreSQL stored procedure errors
      if (error.message && error.message.includes('Error creating complete event:')) {
        const actualError = error.message.replace('Error creating complete event: ', '');
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: actualError
        });
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Error executing stored procedure. Please try again.'
      });
    }

  }, event);
});