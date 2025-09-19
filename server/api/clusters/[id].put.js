// server/api/clusters/[id].put.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
    const tenantContext = event.context.tenant;
    if (event.method !== 'PUT') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: 'This endpoint only accepts PUT requests.' });
    }

    const clusterId = parseInt(event.context.params.id); //.put.js]
    const body = await readBody(event);

    if (isNaN(clusterId) || clusterId <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'El ID del cluster debe ser un número entero positivo.'
      });
    }

    if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'El cuerpo de la solicitud no puede estar vacío y debe contener campos a actualizar.'
      });
    }

    console.log(`PUT /api/clusters/${clusterId} - ID recibido:`, clusterId);
    console.log('PUT /api/clusters/[id] - Datos de actualización:', body);

    return await withPostgresClient(async (client) => {

        try {
            await verifyAuthToken(event);
        } catch (error) {
            throw error;
        }

        const pgQuery = `SELECT updated_cluster_id, status_message FROM public.update_cluster_data($1, $2);`; //.put.js]
        
        const pgValues = [
            clusterId,
            JSON.stringify(body) 
        ];

        console.log('PUT /api/clusters/[id] - Ejecutando consulta SQL:', pgQuery);
        console.log('PUT /api/clusters/[id] - Valores de la consulta:', pgValues);

        const result = await client.query(pgQuery, pgValues);
        console.log('PUT /api/clusters/[id] - Resultado de la consulta a la DB (filas):', result.rows);

        if (result.rows.length === 0 || result.rows[0].updated_cluster_id === null) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Not Found',
            message: result.rows[0] ? result.rows[0].status_message : `Cluster con ID ${clusterId} no encontrado o no actualizable.`
          });
        }

        if (result.rows[0].status_message && result.rows[0].status_message.startsWith('Error')) {
          throw createError({
              statusCode: 400,
              statusMessage: 'Bad Request',
              message: result.rows[0].status_message,
              data: { pgFunctionMessage: result.rows[0].status_message }
          });
        }

        setResponseStatus(event, 200);
        return {
          message: result.rows[0].status_message || 'Cluster actualizado exitosamente.',
          clusterId: result.rows[0].updated_cluster_id
        }; 

    }, event);
});