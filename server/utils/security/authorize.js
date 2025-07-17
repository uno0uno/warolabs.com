// server/utils/security/authorize.js

/**
 * Verifica si el usuario autenticado (desde event.context.user) tiene uno de los roles requeridos.
 * Si el usuario no está autenticado o no tiene los roles necesarios, lanza un H3Error.
 *
 * @param {object} event El objeto de evento de H3/Nitro.
 * @param {string[]} requiredRoles Un array de strings con los roles permitidos para este endpoint.
 * @returns {void} No devuelve nada, pero lanza un error si la autorización falla.
 */
export function authorize(event, requiredRoles) {
  // 1. Verificar si el usuario está autenticado
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Authentication required. No user context found.'
    });
  }

  const userRole = event.context.user.role; // Asume que el payload del JWT tiene una claim 'role'

  // 2. Verificar si el usuario tiene alguno de los roles requeridos
  if (!userRole || !requiredRoles.includes(userRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: `Access denied. User role '${userRole}' is not authorized for this resource. Required roles: ${requiredRoles.join(', ')}`
    });
  }

  // Si el código llega aquí, el usuario está autenticado y autorizado.
}