// server/api/clusters/[id].get.js

import { createClient } from '../../utils/basedataSettings/postgresConnection';
import { postgresErrorDictionary } from '../../utils/basedataSettings/postgresErrorMap';

export default defineEventHandler(async (event) => {
  const client = createClient(); // Crea una instancia del cliente de PostgreSQL

  try {
    await client.connect(); // Establece la conexión con la base de datos

    // --- 1. Leer y Validar el ID del Cluster de la URL ---
    const clusterId = parseInt(event.context.params.id); // Extrae el ID de los parámetros de la URL

    // Validar que el ID sea un número entero válido y positivo (ya que los IDs de clusters son INTEGER)
    if (isNaN(clusterId) || clusterId <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'El ID del cluster debe ser un número entero positivo.'
      });
    }

    // Log del ID recibido para depuración en el servidor Nuxt.js
    console.log(`GET /api/clusters/${clusterId} - ID recibido:`, clusterId);

    // --- 2. Llamada a la Función de PostgreSQL ---
    // La función get_cluster_details retorna una tabla con los detalles del cluster
    const pgQuery = `SELECT cluster_id, profile_id, cluster_name, description, start_date, end_date,
                      cluster_type, slug_cluster, is_active, shadowban, legal_info_id,
                      profile_name, legal_info_nit, areas_data, images_data
                      FROM public.get_cluster_details($1);`;
    
    const pgValues = [clusterId]; // Pasar el ID del cluster como parámetro

    console.log('GET /api/clusters/[id] - Ejecutando consulta SQL:', pgQuery);
    console.log('GET /api/clusters/[id] - Valores de la consulta:', pgValues);

    const result = await client.query(pgQuery, pgValues);
    console.log('GET /api/clusters/[id] - Resultado de la consulta a la DB (filas):', result.rows);

    // --- 3. Manejo de Respuesta ---
    if (result.rows.length === 0) {
      // Si la función no devuelve filas, el cluster no fue encontrado o no cumple las condiciones de visibilidad
      setResponseStatus(event, 404); // Not Found
      return {
        message: `Cluster con ID ${clusterId} no encontrado o no visible.`
      };
    }

    // Si se encuentra el cluster, devuelve sus detalles
    setResponseStatus(event, 200); // OK
    return {
      message: 'Detalles del cluster obtenidos exitosamente',
      cluster: result.rows[0] // La función get_cluster_details devuelve una sola fila si encuentra
    };

  } catch (error) {
    // --- 4. Manejo de Errores ---
    console.error(`Error al obtener detalles del cluster con ID ${event.context.params.id} en el endpoint:`, error);

    const mappedError = postgresErrorDictionary[error.code] || postgresErrorDictionary.default;
    const isAlreadyHttpError = error.statusCode && error.statusMessage;

    throw createError({
      statusCode: isAlreadyHttpError ? error.statusCode : mappedError.httpStatus,
      statusMessage: isAlreadyHttpError ? error.statusMessage : mappedError.statusMessage,
      message: isAlreadyHttpError ? error.message : mappedError.friendlyMessage,
      data: error.detail || error.message || error.data
    });

  } finally {
    if (client) await client.end();
  }
});