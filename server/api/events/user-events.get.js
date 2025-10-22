// server/api/events/user-events.get.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;

  if (event.method !== 'GET') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: 'This endpoint only accepts GET requests.' });
  }

  const queryParams = getQuery(event);
  const limit = parseInt(queryParams.limit) || 50;
  const offset = parseInt(queryParams.offset) || 0;

  if (isNaN(limit) || limit < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'El parámetro "limit" debe ser un número entero no negativo.'
    });
  }
  if (isNaN(offset) || offset < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'El parámetro "offset" debe ser un número entero no negativo.'
    });
  }

  console.log(`🔐 GET /api/events/user-events - Obteniendo eventos para tenant ${tenantContext.tenant_name}`);

  return await withPostgresClient(async (client) => {

    // Obtener el usuario actual de la sesión
    const userId = event.context.session?.user?.id;
    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'Usuario no autenticado. Se requiere sesión válida.'
      });
    }

    console.log(`🔐 User ID from session: ${userId}`);

    // Primero, obtener el profile_id del usuario en el tenant actual
    const profileQuery = `
      SELECT p.profile_id, p.profile_name
      FROM tenant_members tm
      JOIN profile p ON tm.profile_id = p.profile_id
      WHERE tm.user_id = $1 AND tm.tenant_id = $2 AND tm.is_active = true
      LIMIT 1;
    `;

    const profileValues = [userId, tenantContext.tenant_id];
    console.log('GET /api/events/user-events - Buscando profile del usuario:', profileValues);

    const profileResult = await client.query(profileQuery, profileValues);
    
    if (profileResult.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'Usuario no encontrado en este tenant o perfil inactivo.'
      });
    }

    const userProfile = profileResult.rows[0];
    console.log(`🔐 Profile encontrado: ${userProfile.profile_name} (ID: ${userProfile.profile_id})`);

    // Construir filtros desde query params
    const filters = [];
    const filterValues = [userProfile.profile_id, limit, offset];
    let paramIndex = 4;

    let whereClause = 'WHERE c.profile_id = $1';
    
    if (queryParams.type) {
      whereClause += ` AND c.cluster_type = $${paramIndex}`;
      filterValues.push(queryParams.type);
      paramIndex++;
    }
    
    if (queryParams.start_date_after) {
      whereClause += ` AND c.start_date >= $${paramIndex}`;
      filterValues.push(queryParams.start_date_after);
      paramIndex++;
    }
    
    if (queryParams.end_date_before) {
      whereClause += ` AND c.end_date <= $${paramIndex}`;
      filterValues.push(queryParams.end_date_before);
      paramIndex++;
    }

    // Query SQL directa (sin procedimientos almacenados)
    const eventsQuery = `
      SELECT 
        c.cluster_id,
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
        p.profile_name,
        li.nit as legal_info_nit,
        
        -- Contar total de registros para paginación
        COUNT(*) OVER() as total_count,
        
        -- Obtener áreas relacionadas como JSON
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'area_id', ca.area_id,
              'area_name', ca.area_name,
              'description', ca.description
            )
          ) FILTER (WHERE ca.area_id IS NOT NULL),
          '[]'::json
        ) as areas_data,
        
        -- Obtener imágenes relacionadas como JSON
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'image_id', ci.image_id,
              'image_url', ci.image_url,
              'alt_text', ci.alt_text,
              'is_primary', ci.is_primary
            )
          ) FILTER (WHERE ci.image_id IS NOT NULL),
          '[]'::json
        ) as images_data
        
      FROM clusters c
      JOIN profile p ON c.profile_id = p.profile_id
      LEFT JOIN legal_info li ON c.legal_info_id = li.legal_info_id
      LEFT JOIN cluster_areas ca ON c.cluster_id = ca.cluster_id
      LEFT JOIN cluster_images ci ON c.cluster_id = ci.cluster_id
      ${whereClause}
        AND c.is_active = true 
        AND c.shadowban = false
      GROUP BY 
        c.cluster_id, c.profile_id, c.cluster_name, c.description, 
        c.start_date, c.end_date, c.cluster_type, c.slug_cluster, 
        c.legal_info_id, c.is_active, c.shadowban, c.created_at, 
        c.updated_at, p.profile_name, li.nit
      ORDER BY c.start_date DESC, c.created_at DESC
      LIMIT $2 OFFSET $3;
    `;

    console.log('GET /api/events/user-events - Ejecutando query SQL:', eventsQuery);
    console.log('GET /api/events/user-events - Valores:', filterValues);

    const result = await client.query(eventsQuery, filterValues);
    console.log('GET /api/events/user-events - Resultado:', result.rows.length, 'eventos encontrados');

    // Procesar los resultados
    const events = result.rows.map(row => {
      return {
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
        legalInfoNit: row.legal_info_nit,
        areas: row.areas_data,
        images: row.images_data,
        isActive: row.is_active,
        shadowban: row.shadowban,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    });

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    setResponseStatus(event, 200);
    return {
      success: true,
      message: 'Eventos del usuario obtenidos exitosamente',
      events: events,
      totalCount: totalCount,
      pagination: {
        limit: limit,
        offset: offset,
        hasMore: (offset + events.length) < totalCount
      },
      userProfile: {
        id: userProfile.profile_id,
        name: userProfile.profile_name
      }
    }; 

  }, event); 
});