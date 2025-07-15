// server/api/clusters/index.post.js

import { createClient } from '../../utils/basedataSettings/postgresConnection';
import { postgresErrorDictionary } from '../../utils/basedataSettings/postgresErrorMap';

export default defineEventHandler(async (event) => {
  const client = createClient();

  try {
    await client.connect(); // Asegura la conexión a la base de datos

    const body = await readBody(event);

    const { profile_id, cluster_data, areas_data, legal_info_data, images_data } = body;

    // --- 1. Validación de Entrada (igual que antes) ---
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

    console.log('Datos recibidos para crear el cluster:', body);
    
    // --- 2. Llamada a la Función de PostgreSQL ---
    const query = `SELECT created_cluster_id, status_message FROM public.create_cluster_and_related_entities($1, $2, $3, $4, $5);`;
    console.log('Ejecutando consulta SQL:', query);

    // CORRECCIÓN CLAVE: Convertir objetos/arrays JavaScript a cadenas JSON explícitamente
    const values = [
      profile_id,
      JSON.stringify(cluster_data),   // Convertir a string JSON
      JSON.stringify(areas_data),     // Convertir a string JSON
      legal_info_data ? JSON.stringify(legal_info_data) : null, // Convertir, o null si es opcional
      images_data ? JSON.stringify(images_data) : null         // Convertir, o null si es opcional
    ];

    console.log('Valores de la consulta (serializados a JSON):', values);
    const result = await client.query(query, values);
    console.log('Resultado de la consulta a la DB:', result.rows);

    if (result.rows[0] && result.rows[0].status_message && result.rows[0].status_message.startsWith('Error')) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error (DB Function Error)',
            message: result.rows[0].status_message
        });
    }

    // --- 3. Manejo de Respuesta Exitosa ---
    setResponseStatus(event, 201); // 201 Created
    return {
      message: 'Cluster creado exitosamente',
      clusterId: result.rows[0].created_cluster_id
    };

  } catch (error) {
    // --- 4. Manejo de Errores ---
    console.error('Error al crear cluster en el endpoint:', error);

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