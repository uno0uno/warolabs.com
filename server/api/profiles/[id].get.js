// server/api/profiles/[id].get.js - Endpoint público para perfiles por username (filtrado por tenant detectado automáticamente)

import { defineEventHandler, getHeader } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar mapeo de desarrollo
let devSiteMapping = {};
try {
  // Usar ruta absoluta basada en el directorio del proyecto
  const projectRoot = process.cwd();
  const mappingPath = join(projectRoot, 'dev-site-mapping.json');
  console.log(`🔧 Trying to load dev mapping from: ${mappingPath}`);
  devSiteMapping = JSON.parse(readFileSync(mappingPath, 'utf8'));
  console.log(`🔧 Dev site mapping loaded:`, devSiteMapping);
} catch (error) {
  console.log('🔧 Dev site mapping not found, using production mode', error.message);
}

export default defineEventHandler(async (event) => {
  try {
    const username = event.context.params.id;

    if (!username) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username parameter is required'
      });
    }

    // Extraer información del origen del request
    const host = getHeader(event, 'host') || '';
    const origin = getHeader(event, 'origin') || '';
    const referer = getHeader(event, 'referer') || '';
    const forwardedHost = getHeader(event, 'x-forwarded-host') || '';
    const originalHost = getHeader(event, 'x-original-host') || '';
    
    console.log(`👤 Getting public profile for username: ${username}`);
    console.log(`🔍 Request headers - host: ${host}, origin: ${origin}, referer: ${referer}, forwardedHost: ${forwardedHost}, originalHost: ${originalHost}`);

    const result = await withPostgresClient(async (client) => {
      // 1. Buscar el tenant que coincida con cualquiera de los headers del request
      let tenantSiteResult = null;
      let detectedSite = null;
      
      // Determinar sitios según el entorno
      let potentialSites = [];
      
      if (process.env.NODE_ENV === 'development') {
        // En desarrollo, detectar el puerto del request y mapear al tenant correspondiente
        console.log(`🔧 Development mode - checking port mapping`);
        
        // Si la solicitud viene del proxy de warocol.com, debe usar warocol.com como tenant
        if (forwardedHost && devSiteMapping[forwardedHost]) {
          console.log(`🔧 Proxy request from: ${forwardedHost} -> ${devSiteMapping[forwardedHost]}`);
          potentialSites = [devSiteMapping[forwardedHost]];
        } else {
          // Solicitud directa al backend - usar el puerto del backend para determinar tenant
          const backendPort = host.split(':')[1] || '4000';
          const backendHost = `localhost:${backendPort}`;
          
          if (devSiteMapping[backendHost]) {
            console.log(`🔧 Direct request to backend: ${backendHost} -> ${devSiteMapping[backendHost]}`);
            potentialSites = [devSiteMapping[backendHost]];
          } else {
            // Fallback: usar todos los headers disponibles y mapear
            const allSites = [
              host,
              origin?.replace(/^https?:\/\//, ''),
              referer?.replace(/^https?:\/\//, '')?.split('/')[0]
            ].filter(Boolean).filter(site => site && site.length > 0);
            
            const mappedSites = allSites.map(site => 
              devSiteMapping[site] || site
            );
            
            potentialSites = [...new Set(mappedSites)];
          }
        }
      } else {
        // En producción, usar headers reales del proxy/origen
        potentialSites = [
          forwardedHost,  // Header X-Forwarded-Host del proxy
          originalHost,   // Header X-Original-Host personalizado
          origin?.replace(/^https?:\/\//, ''),
          referer?.replace(/^https?:\/\//, '')?.split('/')[0],
          host
        ].filter(Boolean).filter(site => site && site.length > 0);
      }
      
      console.log(`🔍 Potential sites to check: ${potentialSites.join(', ')}`);
      
      for (const site of potentialSites) {
        const result = await client.query(`
          SELECT 
            ts.tenant_id,
            ts.site,
            ts.brand_name,
            t.name as tenant_name,
            t.slug as tenant_slug
          FROM tenant_sites ts
          JOIN tenants t ON t.id = ts.tenant_id
          WHERE ts.site = $1 AND ts.is_active = true
        `, [site]);
        
        if (result.rows.length > 0) {
          tenantSiteResult = result;
          detectedSite = site;
          break;
        }
      }
      
      // Si no se encuentra con los headers exactos, buscar coincidencias parciales
      if (!tenantSiteResult) {
        console.log(`🔍 No exact match found, trying partial matches...`);
        
        const allSitesResult = await client.query(`
          SELECT 
            ts.tenant_id,
            ts.site,
            ts.brand_name,
            t.name as tenant_name,
            t.slug as tenant_slug
          FROM tenant_sites ts
          JOIN tenants t ON t.id = ts.tenant_id
          WHERE ts.is_active = true
        `);
        
        // Buscar coincidencias parciales
        for (const potentialSite of potentialSites) {
          const matchingSite = allSitesResult.rows.find(row => 
            potentialSite.includes(row.site) || row.site.includes(potentialSite.split(':')[0])
          );
          
          if (matchingSite) {
            tenantSiteResult = { rows: [matchingSite] };
            detectedSite = matchingSite.site;
            break;
          }
        }
      }

      // Fallback si no se encuentra ningún tenant
      if (!tenantSiteResult) {
        throw createError({
          statusCode: 404,
          statusMessage: `No tenant found for any of the detected sites: ${potentialSites.join(', ')}`
        });
      }

      const tenantInfo = tenantSiteResult.rows[0];
      console.log(`🏢 Found tenant: ${tenantInfo.tenant_name} for detected site: ${detectedSite}`);

      // 2. Buscar el perfil del usuario que pertenezca a ese tenant específico
      const profileResult = await client.query(`
        SELECT 
          p.name, 
          p.logo_avatar, 
          p.description, 
          p.website, 
          p.city, 
          p.banner, 
          p.category, 
          p.user_name,
          ts.brand_name as tenant_brand,
          t.name as tenant_name,
          t.slug as tenant_slug,
          ts.site as tenant_site
        FROM profile p
        JOIN tenant_members tm ON tm.user_id = p.id
        JOIN tenants t ON t.id = tm.tenant_id
        JOIN tenant_sites ts ON ts.tenant_id = t.id
        WHERE p.user_name = $1 
          AND t.id = $2 
          AND ts.is_active = true
      `, [username, tenantInfo.tenant_id]);

      const profileData = profileResult.rows[0];

      if (!profileData) {
        throw createError({
          statusCode: 404,
          statusMessage: `Profile not found for username ${username} in ${tenantInfo.tenant_name} (${detectedSite})`
        });
      }

      console.log(`✅ User membership verified for ${username} in ${tenantInfo.tenant_name}`);

      return profileData;
    }, event);

    console.log(`✅ Public profile retrieved for username: ${username}`);

    return {
      success: true,
      message: `Public profile retrieved for ${username}`,
      data: result
    };

  } catch (error) {
    console.error('❌ Failed to get public profile:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to get public profile: ${error.message}`
    });
  }
});