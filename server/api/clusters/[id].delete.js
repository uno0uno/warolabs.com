// server/api/clusters/[id].delete.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
    const tenantContext = event.context.tenant;

    if (event.method !== 'DELETE') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: 'This endpoint only accepts DELETE requests.' });
    }

    const clusterId = parseInt(event.context.params.id);

    if (isNaN(clusterId) || clusterId <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'El ID del cluster debe ser un número entero positivo.'
      }); 
    }

    console.log(`DELETE /api/clusters/${clusterId} - ID recibido para soft delete:`, clusterId);

    return await withPostgresClient(async (client) => {

        try {
            await verifyAuthToken(event);
        } catch (error) {
            throw error;
        }

        const pgQuery = `SELECT deleted_cluster_id, status_message FROM public.soft_delete_cluster($1);`;
        
        const pgValues = [clusterId];

        console.log('DELETE /api/clusters/[id] - Ejecutando consulta SQL:', pgQuery);
        console.log('DELETE /api/clusters/[id] - Valores de la consulta:', pgValues);

        const result = await client.query(pgQuery, pgValues);
        console.log('DELETE /api/clusters/[id] - Resultado de la consulta a la DB (filas):', result.rows);

        if (result.rows.length === 0 || result.rows[0].deleted_cluster_id === null) {
            const statusMessage = result.rows[0] ? result.rows[0].status_message : `Cluster con ID ${clusterId} no encontrado o no pudo ser soft-eliminado.`;
            
            let statusCode = 500; 
            if (statusMessage.includes('no encontrado')) {
                statusCode = 404; 
            } else if (statusMessage.includes('no esta activo o esta baneado') || statusMessage.includes('No se puede desactivar el cluster')) {
                statusCode = 403;
            }

            throw createError({
              statusCode: statusCode,
              statusMessage: statusMessage,
              message: statusMessage,
              data: { pgFunctionMessage: statusMessage }
            });
        }

        setResponseStatus(event, 200);
        return {
          message: result.rows[0].status_message || 'Cluster soft-eliminado exitosamente.',
          clusterId: result.rows[0].deleted_cluster_id
        }; 

    }, event); 
});