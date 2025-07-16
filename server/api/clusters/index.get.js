// server/api/clusters/index.get.js

import { createClient } from '../../utils/basedataSettings/postgresConnection';
import { postgresErrorDictionary } from '../../utils/basedataSettings/postgresErrorMap';

export default defineEventHandler(async (event) => {
  const client = createClient(); // Crea una instancia del cliente de PostgreSQL

  try {
    await client.connect(); // Establece la conexión con la base de datos

    // --- 1. Leer y Validar Parámetros de la URL ---
    const queryParams = getQuery(event); // Obtiene los parámetros de la URL (ej. ?limit=10&offset=0&name=Festival)

    const limit = parseInt(queryParams.limit) || 10; // Valor por defecto 10
    const offset = parseInt(queryParams.offset) || 0; // Valor por defecto 0

    // Validar que limit y offset sean números enteros no negativos
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

    // Construir el objeto p_filters para pasar a la función de PostgreSQL
    const p_filters = {};
    if (queryParams.name) p_filters.name = queryParams.name;
    if (queryParams.type) p_filters.type = queryParams.type;
    // Eliminado: if (queryParams.is_active !== undefined) p_filters.is_active = queryParams.is_active === 'true';
    // Eliminado: if (queryParams.shadowban !== undefined) p_filters.shadowban = queryParams.shadowban === 'true';
    if (queryParams.start_date_after) p_filters.start_date_after = queryParams.start_date_after;
    if (queryParams.end_date_before) p_filters.end_date_before = queryParams.end_date_before;
    // Añade aquí más filtros según los parámetros que quieras soportar (ej. profile_id, slug_cluster)

    // Log de los parámetros recibidos para depuración en el servidor Nuxt.js
    console.log('GET /api/clusters - Parámetros recibidos:', { limit, offset, p_filters });

    // --- 2. Llamada a la Función de PostgreSQL ---
    // La función get_clusters_list retorna una tabla con todos los campos y el total_count
    const pgQuery = `SELECT cluster_id, profile_id, cluster_name, description, start_date, end_date,
                      cluster_type, slug_cluster, legal_info_id,
                      profile_name, legal_info_nit, areas_data, images_data, total_count
                      FROM public.get_clusters_list($1, $2, $3);`;
    
    // Los valores a pasar a la función de PostgreSQL
    // JSON.stringify() es necesario para el parámetro jsonb
    const pgValues = [
      limit,
      offset,
      JSON.stringify(p_filters) // Convertir el objeto de filtros a string JSON
    ];

    console.log('GET /api/clusters - Ejecutando consulta SQL:', pgQuery);
    console.log('GET /api/clusters - Valores de la consulta:', pgValues);

    const result = await client.query(pgQuery, pgValues);
    console.log('GET /api/clusters - Resultado de la consulta a la DB (filas):', result.rows);

    // Extraer los clusters y el totalCount. total_count es el mismo en todas las filas.
    // Si no hay filas, el totalCount es 0.
    const clusters = result.rows.map(row => {
      const clusterData = { ...row };
      delete clusterData.total_count;
      return clusterData;
    });

    const totalCount = result.rows.length > 0 ? result.rows[0].total_count : 0;


    // --- 3. Manejo de Respuesta Exitosa ---
    setResponseStatus(event, 200); // 200 OK
    return {
      message: 'Clusters obtenidos exitosamente',
      clusters: clusters,
      totalCount: totalCount
    };

  } catch (error) {
    // --- 4. Manejo de Errores ---
    console.error('Error al obtener clusters en el endpoint:', error);

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