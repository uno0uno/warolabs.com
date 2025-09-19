// server/api/clusters/index.post.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;

  if (event.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: 'This endpoint only accepts POST requests.' });
  }

  const body = await readBody(event);
  const { profile_id, cluster_data, areas_data, legal_info_data, images_data } = body;

  if (!profile_id) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'El ID del perfil (profile_id) es obligatorio.' });
  }
  if (!cluster_data || typeof cluster_data !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Los datos del cluster (cluster_data) son obligatorios y deben ser un objeto JSON.' });
  }
  if (!areas_data || !Array.isArray(areas_data) || areas_data.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Los datos de las áreas (areas_data) son obligatorios y deben ser un array JSON no vacío.' });
  }
  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(profile_id)) {
      throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'El ID del perfil (profile_id) tiene un formato UUID inválido.' });
  }


  return await withPostgresClient(async (client) => {
    console.log(`🔐 Creando cluster para tenant: ${tenantContext.tenant_name}`);

    const query = `SELECT created_cluster_id, status_message FROM public.create_cluster_and_related_entities($1, $2, $3, $4, $5);`;
    console.log('Ejecutando consulta SQL:', query);

    const values = [
      profile_id,
      JSON.stringify(cluster_data),
      JSON.stringify(areas_data),
      legal_info_data ? JSON.stringify(legal_info_data) : null,
      images_data ? JSON.stringify(images_data) : null
    ];

    console.log('Valores de la consulta (serializados a JSON):', values);
    const result = await client.query(query, values);
    console.log('Resultado de la consulta a la DB:', result.rows);

    if (result.rows[0] && result.rows[0].status_message && result.rows[0].status_message.startsWith('Error')) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: result.rows[0].status_message,
            data: { pgFunctionMessage: result.rows[0].status_message }
        });
    }

    setResponseStatus(event, 201);
    return {
      message: 'Cluster creado exitosamente',
      clusterId: result.rows[0].created_cluster_id
    };

  }, event);
});