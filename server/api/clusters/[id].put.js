// server/api/clusters/[id].put.js

import { createClient } from '../../utils/basedataSettings/postgresConnection'; // Importa la función para crear el cliente de PostgreSQL
import { postgresErrorDictionary } from '../../utils/basedataSettings/postgresErrorMap'; // Importa el mapa de errores de PostgreSQL

export default defineEventHandler(async (event) => {
  const client = createClient(); // Crea una instancia del cliente de PostgreSQL

  try {
    await client.connect(); // Establece la conexión con la base de datos

    // --- 1. Leer y Validar el ID del Cluster y el Cuerpo de la Solicitud ---
    const clusterId = parseInt(event.context.params.id); // Extrae el ID del cluster de los parámetros de la URL
    const body = await readBody(event); // Lee el cuerpo de la solicitud (contiene los campos a actualizar)

    // Validar que el ID sea un número entero válido y positivo
    if (isNaN(clusterId) || clusterId <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'El ID del cluster debe ser un número entero positivo.'
      });
    }

    // Validar que el cuerpo de la solicitud (p_updates) no esté vacío
    if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'El cuerpo de la solicitud no puede estar vacío y debe contener campos a actualizar.'
      });
    }

    // Puedes añadir validaciones más específicas aquí para los campos en 'body'
    // Por ejemplo, validar formatos de fecha, tipos de datos, etc.

    console.log(`PUT /api/clusters/${clusterId} - ID recibido:`, clusterId);
    console.log('PUT /api/clusters/[id] - Datos de actualización:', body);

    // --- 2. Llamada a la Función de PostgreSQL ---
    // La función update_cluster_data retorna updated_cluster_id y status_message
    const pgQuery = `SELECT updated_cluster_id, status_message FROM public.update_cluster_data($1, $2);`;
    
    // El 'body' completo se pasa como el parámetro jsonb p_updates
    const pgValues = [
      clusterId,
      JSON.stringify(body) // Convertir el objeto de actualizaciones a string JSON
    ];

    console.log('PUT /api/clusters/[id] - Ejecutando consulta SQL:', pgQuery);
    console.log('PUT /api/clusters/[id] - Valores de la consulta:', pgValues);

    const result = await client.query(pgQuery, pgValues);
    console.log('PUT /api/clusters/[id] - Resultado de la consulta a la DB (filas):', result.rows);

    // --- 3. Manejo de Respuesta ---
    // La función de PG ya maneja si el cluster no existe.
    if (result.rows.length === 0 || result.rows[0].updated_cluster_id === null) {
      setResponseStatus(event, 404); // Not Found (si la función devuelve NULL para el ID actualizado)
      return {
        message: result.rows[0] ? result.rows[0].status_message : `Cluster con ID ${clusterId} no encontrado o no actualizable.`
      };
    }

    // Si la función de PG retorna un mensaje de error explícito (aunque debería ser atrapado en el catch)
    if (result.rows[0].status_message && result.rows[0].status_message.startsWith('Error')) {
      throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error (DB Function Error)',
          message: result.rows[0].status_message
      });
    }

    // Si se actualiza con éxito
    setResponseStatus(event, 200); // OK
    return {
      message: result.rows[0].status_message || 'Cluster actualizado exitosamente.',
      clusterId: result.rows[0].updated_cluster_id
    };

  } catch (error) {
    // --- 4. Manejo de Errores ---
    console.error(`Error al actualizar cluster con ID ${event.context.params.id} en el endpoint:`, error);

    const mappedError = postgresErrorDictionary[error.code] || postgresErrorDictionary.default;
    const isAlreadyHttpError = error.statusCode && error.statusMessage;

    throw createError({
      statusCode: isAlreadyHttpError ? error.statusCode : mappedError.httpStatus,
      statusMessage: isAlreadyHttpError ? error.statusMessage : mappedError.statusMessage,
      message: isAlreadyHttpError ? error.message : mappedError.friendlyMessage,
      data: error.detail || error.message || error.data
    });

  } finally {
    // Asegúrate de cerrar la conexión del cliente
    if (client) await client.end();
  }
});