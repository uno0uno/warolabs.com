// server/api/clusters/index.get.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;

  if (event.method !== 'GET') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: 'This endpoint only accepts GET requests.' });
  }

  const queryParams = getQuery(event); //

  const limit = parseInt(queryParams.limit) || 10; //
  const offset = parseInt(queryParams.offset) || 0; //

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

  const p_filters = {}; //
  if (queryParams.name) p_filters.name = queryParams.name; //
  if (queryParams.type) p_filters.type = queryParams.type; //
  if (queryParams.start_date_after) p_filters.start_date_after = queryParams.start_date_after; //
  if (queryParams.end_date_before) p_filters.end_date_before = queryParams.end_date_before; //

  console.log(`🔐 GET /api/clusters - Parámetros recibidos para tenant ${tenantContext.tenant_name}:`, { limit, offset, p_filters });

  return await withPostgresClient(async (client) => {

    const pgQuery = `SELECT cluster_id, profile_id, cluster_name, description, start_date, end_date,
                      cluster_type, slug_cluster, legal_info_id,
                      profile_name, legal_info_nit, areas_data, images_data, total_count
                      FROM public.get_clusters_list($1, $2, $3);`; //
    
    const pgValues = [
      limit,
      offset,
      JSON.stringify(p_filters)
    ]; //

    console.log('GET /api/clusters - Ejecutando consulta SQL:', pgQuery); //
    console.log('GET /api/clusters - Valores de la consulta:', pgValues); //

    const result = await client.query(pgQuery, pgValues); //
    console.log('GET /api/clusters - Resultado de la consulta a la DB:', result.rows); //

    const clusters = result.rows.map(row => {
      const clusterData = { ...row };
      delete clusterData.total_count;
      return clusterData;
    }); //

    const totalCount = result.rows.length > 0 ? result.rows[0].total_count : 0; //

    setResponseStatus(event, 200);
    return {
      message: 'Clusters obtenidos exitosamente',
      clusters: clusters,
      totalCount: totalCount
    }; 

  }, event); 
});