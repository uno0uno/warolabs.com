// server/api/clusters/[id].delete.js

import { createClient } from '../../utils/basedataSettings/postgresConnection'; // Importa la función para crear el cliente de PostgreSQL
import { postgresErrorDictionary } from '../../utils/basedataSettings/postgresErrorMap'; // Importa el mapa de errores de PostgreSQL

export default defineEventHandler(async (event) => {
  const client = createClient(); // Crea una instancia del cliente de PostgreSQL

  try {
    await client.connect(); // Establece la conexión con la base de datos

    // --- 1. Leer y Validar el ID del Cluster de la URL ---
    const clusterId = parseInt(event.context.params.id); // Extrae el ID del cluster de los parámetros de la URL

    // Validar que el ID sea un número entero válido y positivo
    if (isNaN(clusterId) || clusterId <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'El ID del cluster debe ser un número entero positivo.'
      });
    }

    // Log del ID recibido para depuración en el servidor Nuxt.js
    console.log(`DELETE /api/clusters/${clusterId} - ID recibido para soft delete:`, clusterId);

    // --- 2. Llamada a la Función de PostgreSQL ---
    // La función soft_delete_cluster retorna deleted_cluster_id y status_message
    const pgQuery = `SELECT deleted_cluster_id, status_message FROM public.soft_delete_cluster($1);`;
    
    const pgValues = [clusterId]; // Pasar el ID del cluster como parámetro

    console.log('DELETE /api/clusters/[id] - Ejecutando consulta SQL:', pgQuery);
    console.log('DELETE /api/clusters/[id] - Valores de la consulta:', pgValues);

    const result = await client.query(pgQuery, pgValues);
    console.log('DELETE /api/clusters/[id] - Resultado de la consulta a la DB (filas):', result.rows);

    // --- 3. Manejo de Respuesta ---
    // La función de PG ya maneja los casos de no encontrado o restricciones.
    if (result.rows.length === 0 || result.rows[0].deleted_cluster_id === null) {
      // Si la función devuelve NULL para el ID, significa que no se encontró, no estaba activo, o falló por restricción.
      const statusMessage = result.rows[0] ? result.rows[0].status_message : `Cluster con ID ${clusterId} no encontrado o no pudo ser soft-eliminado.`;
      
      // Mapear mensajes específicos a estados HTTP
      let statusCode = 500;
      if (statusMessage.includes('no encontrado')) {
          statusCode = 404; // Not Found
      } else if (statusMessage.includes('no esta activo o esta baneado') || statusMessage.includes('No se puede desactivar el cluster')) {
          statusCode = 403; // Forbidden
      }

      throw createError({
        statusCode: statusCode,
        statusMessage: statusMessage,
        message: statusMessage
      });
    }

    // Si se soft-elimina con éxito
    setResponseStatus(event, 200); // OK (o 204 No Content si no quieres cuerpo de respuesta)
    return {
      message: result.rows[0].status_message || 'Cluster soft-eliminado exitosamente.',
      clusterId: result.rows[0].deleted_cluster_id
    };

  } catch (error) {
    // --- 4. Manejo de Errores ---
    console.error(`Error al soft-eliminar cluster con ID ${event.context.params.id} en el endpoint:`, error);

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