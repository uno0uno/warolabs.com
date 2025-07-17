// server/utils/security/jwtVerifier.js

import jwt from 'jsonwebtoken'; // Asegúrate de que 'jsonwebtoken' esté instalado.

/**
 * Verifica un JSON Web Token (JWT) de una solicitud.
 * Si el token es válido, adjunta la información decodificada al contexto del evento.
 * La distinción entre token de usuario y token de backend se hace
 * inspeccionando una claim ('backendId' como ejemplo) en el payload del JWT decodificado
 * que debe coincidir con el 'tokenBackend' configurado.
 * Si no es válido o está ausente, lanza un error HTTP.
 *
 * @param {object} event El objeto de evento de H3/Nitro.
 * @returns {Promise<void>} Una promesa que se resuelve si el token es válido, o se rechaza con un H3Error.
 */
export async function verifyAuthToken(event) {
  // Obtenemos las configuraciones de runtime: la clave secreta principal para JWTs
  // y el valor que se espera en una claim del payload para identificar un token de backend.
  const { jwtSecret, tokenBackend } = useRuntimeConfig();

  // Verifica que la clave secreta JWT esté configurada (esencial para cualquier verificación JWT).
  if (!jwtSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'JWT secret not configured for token verification.'
    });
  }

  // 1. Intenta obtener el encabezado de autorización de la solicitud.
  const authHeader = getRequestHeader(event, 'Authorization');

  // Si el encabezado no existe o no tiene el formato esperado 'Bearer <token>'.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Missing or invalid Authorization header.'
    });
  }

  // Extrae la parte del token (la cadena JWT) del encabezado.
  const token = authHeader.split(' ')[1];

  try {
    // 2. Decodifica y valida el token JWT usando la clave secreta principal (jwtSecret).
    // Esta es la validación estándar de un JWT, que comprueba la firma y la expiración.
    const decoded = jwt.verify(token, jwtSecret); //

    // 3. Adjunta la información decodificada (el payload del JWT) al contexto del evento.
    // Esto hace que la información del usuario/servicio esté disponible para los handlers posteriores.
    event.context.user = decoded;

    // 4. Lógica para distinguir entre token de usuario y token de backend
    //    basada en el contenido del payload decodificado y el valor de 'tokenBackend'.
    //    Asumimos que un token de backend tiene una claim específica, como 'backendId',
    //    cuyo valor debe coincidir con el 'tokenBackend' configurado.
    if (tokenBackend && decoded.backendId === tokenBackend) { // Asume que el payload incluye { backendId: "2" }
      console.log('Request authenticated as backend service via JWT payload:', decoded.backendId);
      // Opcional: Podrías estandarizar el objeto user si 'decoded' tiene muchas propiedades
      // que no necesitas en el contexto de 'backend-service'.
        event.context.user = { id: decoded.backendId, role: 'system', isBackendService: true };
    } else if (decoded.userId) { // Asume que los tokens de usuario tienen una claim 'userId'
      console.log('Request authenticated as regular user:', decoded.userId);
    } else {
      // Si el token es válido pero su payload no contiene 'userId' ni 'backendId'
      // para identificar su tipo, se considera un error de autorización.
      console.warn('JWT valid but unknown user/service type:', decoded);
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: 'Authenticated token payload does not identify user or service type.'
      });
    }

  } catch (error) {
    // 5. Manejo de errores de verificación JWT (firma inválida, expiración, etc.).
    const statusCode = error.name === 'TokenExpiredError' ? 401 : 403; //
    const statusMessage = error.name === 'TokenExpiredError' ? 'Unauthorized' : 'Forbidden';

    throw createError({
      statusCode: statusCode,
      statusMessage: statusMessage,
      message: `Invalid or expired token: ${error.message}`
    });
  }
}