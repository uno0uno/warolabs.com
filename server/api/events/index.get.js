// server/api/events/index.get.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;

  if (event.method !== 'GET') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: 'This endpoint only accepts GET requests.' });
  }

  const queryParams = getQuery(event);
  const limit = parseInt(queryParams.limit) || 10;
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

  console.log(`🔐 GET /api/events - Obteniendo eventos para tenant ${tenantContext.tenant_name}:`, { limit, offset });

  return await withPostgresClient(async (client) => {

    // Construir filtros dinámicos
    const filterValues = [limit, offset];
    let whereClause = '';
    let paramIndex = 3;

    const conditions = [];

    // Filtros desde query params
    if (queryParams.name) {
      conditions.push(`c.cluster_name ILIKE $${paramIndex}`);
      filterValues.push(`%${queryParams.name}%`);
      paramIndex++;
    }

    if (queryParams.type) {
      conditions.push(`c.cluster_type = $${paramIndex}`);
      filterValues.push(queryParams.type);
      paramIndex++;
    }

    if (queryParams.start_date_after) {
      conditions.push(`c.start_date >= $${paramIndex}`);
      filterValues.push(queryParams.start_date_after);
      paramIndex++;
    }

    if (queryParams.end_date_before) {
      conditions.push(`c.end_date <= $${paramIndex}`);
      filterValues.push(queryParams.end_date_before);
      paramIndex++;
    }

    if (queryParams.profile_id) {
      conditions.push(`c.profile_id = $${paramIndex}`);
      filterValues.push(queryParams.profile_id);
      paramIndex++;
    }

    // Filtros obligatorios
    conditions.push('c.is_active = true');
    conditions.push('c.shadowban = false');

    // Filtro por tenant (basado en profile que pertenece al tenant)
    conditions.push(`p.id IN (
      SELECT tm.user_id 
      FROM tenant_members tm 
      WHERE tm.tenant_id = $${paramIndex}
    )`);
    filterValues.push(tenantContext.tenant_id);

    whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Query SQL directa para obtener eventos con tenant isolation
    const eventsQuery = `
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
        
        -- Contar total de registros para paginación
        COUNT(*) OVER() as total_count,
        
        -- Obtener áreas relacionadas como JSON
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'area_id', a.id,
              'area_name', a.area_name,
              'description', a.description
            )
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'::json
        ) as areas_data,
        
        -- Obtener imágenes relacionadas como JSON
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'image_id', ci.image_id,
              'image_url', i.path,
              'alt_text', i.description,
              'name', i.name,
              'mime_type', i.mime_type
            )
          ) FILTER (WHERE ci.image_id IS NOT NULL),
          '[]'::json
        ) as images_data
        
      FROM clusters c
      JOIN profile p ON c.profile_id = p.id
      LEFT JOIN legal_info li ON c.legal_info_id = li.id
      LEFT JOIN areas a ON c.id = a.cluster_id
      LEFT JOIN cluster_images ci ON c.id = ci.cluster_id
      LEFT JOIN images i ON ci.image_id = i.id
      ${whereClause}
      GROUP BY 
        c.id, c.profile_id, c.cluster_name, c.description, 
        c.start_date, c.end_date, c.cluster_type, c.slug_cluster, 
        c.legal_info_id, c.is_active, c.shadowban, c.created_at, 
        c.updated_at, p.name, li.nit
      ORDER BY c.start_date DESC, c.created_at DESC
      LIMIT $1 OFFSET $2;
    `;

    console.log('GET /api/events - Ejecutando query SQL:', eventsQuery);
    console.log('GET /api/events - Valores:', filterValues);

    const result = await client.query(eventsQuery, filterValues);
    console.log('GET /api/events - Resultado:', result.rows.length, 'eventos encontrados');

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
      message: 'Eventos obtenidos exitosamente',
      events: events,
      totalCount: totalCount,
      pagination: {
        limit: limit,
        offset: offset,
        hasMore: (offset + events.length) < totalCount
      },
      filters: {
        name: queryParams.name || null,
        type: queryParams.type || null,
        startDateAfter: queryParams.start_date_after || null,
        endDateBefore: queryParams.end_date_before || null,
        profileId: queryParams.profile_id || null
      }
    }; 

  }, event); 
});