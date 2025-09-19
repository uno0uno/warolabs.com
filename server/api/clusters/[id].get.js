// server/api/clusters/[id].get.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
    const tenantContext = event.context.tenant;
    if (event.method !== 'GET') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: 'This endpoint only accepts GET requests.' });
    }

    const clusterId = parseInt(event.context.params.id);

    if (isNaN(clusterId) || clusterId <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'El ID del cluster debe ser un número entero positivo.'
      });
    }


    console.log(`GET /api/clusters/${clusterId} - ID recibido:`, clusterId);

    return await withPostgresClient(async (client) => {

        // try {
        //     await verifyAuthToken(event);
        // } catch (error) {
        //     throw error;
        // }

        const pgQuery = `SELECT cluster_id, profile_id, cluster_name, description, start_date, end_date,
                          cluster_type, slug_cluster, is_active, shadowban, legal_info_id,
                          profile_name, legal_info_nit, areas_data, images_data
                          FROM public.get_cluster_details($1);`; 
        
        const pgValues = [clusterId]; 

        console.log('GET /api/clusters/[id] - Ejecutando consulta SQL:', pgQuery);
        console.log('GET /api/clusters/[id] - Valores de la consulta:', pgValues); 

        const result = await client.query(pgQuery, pgValues); 
        console.log('GET /api/clusters/[id] - Resultado de la consulta a la DB (filas):', result.rows);

        if (result.rows.length === 0) {
            throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Cluster con ID ${clusterId} no encontrado o no visible.` }); //.get.js]
        }

        setResponseStatus(event, 200); 
        return {
          message: 'Detalles del cluster obtenidos exitosamente',
          cluster: result.rows[0] 
        };

    }, event);
});