// server/utils/security/jwtVerifier.js

import jwt from 'jsonwebtoken'; // Asegúrate de que 'jsonwebtoken' esté instalado.

/**
 * Verifica un JSON Web Token (JWT) de una solicitud.
 * Si el token es válido, adjunta la información decodificada al contexto del evento.
 * Lanza un H3Error si el token no es válido o está ausente.
 *
 * @param {object} event El objeto de evento de H3/Nitro.
 * @returns {Promise<void>} Una promesa que se resuelve si el token es válido, o se rechaza con un H3Error.
 */
export async function verifyAuthToken(event) {
  const { jwtSecret, tokenBackend } = useRuntimeConfig();

  if (!jwtSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'JWT secret not configured for token verification.'
    });
  }

  const authHeader = getRequestHeader(event, 'Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Missing or invalid Authorization header.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret); //

    event.context.user = { ...decoded };

    if (tokenBackend && decoded.backendId === tokenBackend) {
      event.context.user.type = 'backend-service';
      if (!event.context.user.role) {
        event.context.user.role = 'system-service';
      }
    } else if (decoded.userId) {
      event.context.user.type = 'regular-user';
      if (!event.context.user.role) {
        event.context.user.role = 'user';
      }
    } else {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: 'Authenticated token payload does not identify user or service type.'
      });
    }

  } catch (error) {
    // 5. Manejo de errores de verificación JWT (firma inválida, expiración, etc.).
    const statusCode = error.name === 'TokenExpiredError' ? 401 : 403;
    const statusMessage = error.name === 'TokenExpiredError' ? 'Unauthorized' : 'Forbidden';
    const errorMessage = `Invalid or expired token: ${error.message}`;

    // **CORRECCIÓN CLAVE AQUÍ:** Lanza el H3Error directamente.
    // `createError` ya devuelve un objeto con `statusCode`, `statusMessage`, etc.
    // Al lanzarlo, la función lo propaga y el sistema de manejo de errores de Nitro lo procesará.
    throw createError({
      statusCode: statusCode,
      statusMessage: statusMessage,
      message: errorMessage,
      data: error // Adjunta el error original para depuración si es necesario
    });
  }
}