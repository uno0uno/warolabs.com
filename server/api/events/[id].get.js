// server/api/events/[id].get.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { readFileSync } from 'fs';
import { join } from 'path';

export default defineEventHandler(async (event) => {
    
    if (event.method !== 'GET') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: 'This endpoint only accepts GET requests.' });
    }

    const eventId = parseInt(event.context.params.id);
    
    // Detect tenant from headers for public access
    const host = getHeader(event, 'host') || '';
    const origin = getHeader(event, 'origin') || '';
    const referer = getHeader(event, 'referer') || '';
    let currentSite = 'warolabs.com'; // Default
    
    // Detect site (same logic as middleware)
    if (process.env.NODE_ENV === 'development') {
        try {
            const devSiteMappingPath = join(process.cwd(), 'dev-site-mapping.json');
            const devSiteMapping = JSON.parse(readFileSync(devSiteMappingPath, 'utf8'));
            
            // Check origin first (from proxied requests)
            if (origin) {
                const url = new URL(origin);
                const hostWithPort = `${url.hostname}:${url.port}`;
                if (devSiteMapping[hostWithPort]) {
                    currentSite = devSiteMapping[hostWithPort];
                }
            }
            // Check referer if origin not available
            else if (referer) {
                const url = new URL(referer);
                const hostWithPort = `${url.hostname}:${url.port}`;
                if (devSiteMapping[hostWithPort]) {
                    currentSite = devSiteMapping[hostWithPort];
                }
            }
            // Check direct host (backend host)
            else if (host) {
                if (devSiteMapping[host]) {
                    currentSite = devSiteMapping[host];
                }
            }
        } catch (error) {
            console.error('❌ Error reading dev-site-mapping.json:', error);
        }
    } else {
        // En producción, usar lógica existente
        if (host.includes('warocol.com')) {
            currentSite = 'warocol.com';
        } else if (host.includes('warolabs.com')) {
            currentSite = 'warolabs.com';
        }
    }
    
    // Get tenant_id for detected site
    let tenantId;
    const expectedTenantName = currentSite === 'warocol.com' ? 'Waro Colombia' : 'WaroLabs';
    
    // Query to get tenant_id from site
    const tenantQuery = `
        SELECT ts.tenant_id 
        FROM tenant_sites ts
        JOIN tenants t ON t.id = ts.tenant_id
        WHERE ts.site = $1 AND ts.is_active = true AND t.name = $2
    `;
    
    const tenantResult = await withPostgresClient(async (client) => {
        return await client.query(tenantQuery, [currentSite, expectedTenantName]);
    });
    
    if (tenantResult.rows.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: `No tenant found for site: ${currentSite}`
        });
    }
    
    tenantId = tenantResult.rows[0].tenant_id;

    if (isNaN(eventId) || eventId <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'El ID del evento debe ser un número entero positivo.'
      });
    }

    console.log(`GET /api/events/${eventId} - ID recibido:`, eventId);

    return await withPostgresClient(async (client) => {

        // Query SQL directa para obtener evento específico con tenant isolation
        const eventQuery = `
          SELECT 
            c.id as cluster_id,
            c.profile_id,
            c.cluster_name,
            c.description,
            c.start_date,
            c.end_date,
            c.cluster_type,
            c.slug_cluster,
            c.legal_info_id,
            c.is_active,
            c.shadowban,
            c.created_at,
            c.updated_at,
            p.name as profile_name,
            li.nit as legal_info_nit,
            li.legal_name as legal_info_company_name,
            li.address as legal_info_address,
            li.city as legal_info_city,
            li.country as legal_info_country,
            
            -- Obtener áreas relacionadas como JSON con información completa
            COALESCE(
              json_agg(
                DISTINCT jsonb_build_object(
                  'area_id', a.id,
                  'area_name', a.area_name,
                  'description', a.description,
                  'capacity', a.capacity,
                  'price', a.price,
                  'currency', a.currency,
                  'unit_capacity', a.unit_capacity,
                  'nomenclature_letter', a.nomenclature_letter,
                  'status', a.status,
                  'service', a.service,
                  'extra_attributes', a.extra_attributes
                )
              ) FILTER (WHERE a.id IS NOT NULL),
              '[]'::json
            ) as areas_data,
            
            -- Obtener imágenes relacionadas como JSON
            COALESCE(
              json_agg(
                DISTINCT jsonb_build_object(
                  'image_id', img.id,
                  'name', img.name,
                  'alt_text', img.description,
                  'image_url', img.path,
                  'mime_type', img.mime_type
                )
              ) FILTER (WHERE img.id IS NOT NULL),
              '[]'::json
            ) as images_data
            
          FROM clusters c
          JOIN profile p ON c.profile_id = p.id
          JOIN tenant_members tm ON p.id = tm.user_id
          LEFT JOIN legal_info li ON c.legal_info_id = li.id
          LEFT JOIN areas a ON c.id = a.cluster_id
          LEFT JOIN cluster_images ci ON c.id = ci.cluster_id
          LEFT JOIN images img ON ci.image_id = img.id
          WHERE c.id = $1
            AND tm.tenant_id = $2
            AND c.is_active = true 
            AND c.shadowban = false
          GROUP BY 
            c.id, c.profile_id, c.cluster_name, c.description, 
            c.start_date, c.end_date, c.cluster_type, c.slug_cluster, 
            c.legal_info_id, c.is_active, c.shadowban, c.created_at, 
            c.updated_at, p.name, li.nit, li.legal_name, li.address, 
            li.city, li.country;
        `;
        
        const eventValues = [eventId, tenantId];

        console.log('GET /api/events/[id] - Ejecutando query SQL:', eventQuery);
        console.log('GET /api/events/[id] - Valores:', eventValues);

        const result = await client.query(eventQuery, eventValues);
        console.log('GET /api/events/[id] - Resultado:', result.rows.length, 'evento(s) encontrado(s)');

        if (result.rows.length === 0) {
            throw createError({ 
                statusCode: 404, 
                statusMessage: 'Not Found', 
                message: `Evento con ID ${eventId} no encontrado o no visible.` 
            });
        }

        const row = result.rows[0];
        const eventData = {
            id: row.cluster_id,
            name: row.cluster_name,
            description: row.description,
            startDate: row.start_date,
            endDate: row.end_date,
            type: row.cluster_type,
            slug: row.slug_cluster,
            profileId: row.profile_id,
            profileName: row.profile_name,
            legalInfoId: row.legal_info_id,
            legalInfo: {
                nit: row.legal_info_nit,
                company_name: row.legal_info_company_name,
                address: row.legal_info_address,
                city: row.legal_info_city,
                country: row.legal_info_country
            },
            areas: row.areas_data,
            images: row.images_data,
            isActive: row.is_active,
            shadowban: row.shadowban,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };

        setResponseStatus(event, 200);
        return {
          success: true,
          message: 'Evento obtenido exitosamente',
          event: eventData
        };

    }, event);
});