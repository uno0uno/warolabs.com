import { withPostgresClient } from '../basedataSettings/withPostgresClient';

/**
 * Utilidad para aislar datos por tenant y verificar autenticación
 * Cada endpoint debe usar esta función para garantizar seguridad multi-tenant
 */

/**
 * Obtiene el contexto de tenant del usuario autenticado
 * @param {H3Event} event - Event de H3
 * @returns {Promise<Object>} - Información del tenant y usuario
 */
export async function getTenantContext(event) {
  // Verificar token de sesión
  const sessionToken = getCookie(event, 'session-token');
  
  if (!sessionToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token de sesión requerido'
    });
  }

  return await withPostgresClient(async (client) => {
    // Obtener información completa del usuario y tenant
    const result = await client.query(`
      SELECT 
        s.id as session_id,
        s.user_id,
        p.email,
        p.name,
        p.enterprise,
        tm.role,
        t.id as tenant_id,
        t.name as tenant_name,
        t.slug as tenant_slug,
        CASE 
          WHEN tm.role = 'superuser' THEN true
          ELSE false
        END as is_superuser
      FROM sessions s
      JOIN profile p ON s.user_id = p.id
      LEFT JOIN tenant_members tm ON p.id = tm.user_id
      LEFT JOIN tenants t ON tm.tenant_id = t.id
      WHERE s.id = $1 
        AND s.expires_at > NOW() 
        AND s.is_active = true
    `, [sessionToken]);

    if (result.rows.length === 0) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Sesión inválida o expirada'
      });
    }

    const tenantContext = result.rows[0];

    // Actualizar actividad de la sesión
    await client.query(`
      UPDATE sessions 
      SET last_activity_at = NOW() 
      WHERE id = $1
    `, [sessionToken]);

    return {
      session_id: tenantContext.session_id,
      user_id: tenantContext.user_id,
      profile_id: tenantContext.user_id, // user_id is the same as profile_id
      email: tenantContext.email,
      name: tenantContext.name,
      enterprise: tenantContext.enterprise,
      role: tenantContext.role,
      tenant_id: tenantContext.tenant_id,
      tenant_name: tenantContext.tenant_name,
      tenant_slug: tenantContext.tenant_slug,
      is_superuser: tenantContext.is_superuser
    };
  }, event);
}

/**
 * Aplica filtro de tenant a una query SQL usando JOINs con profile
 * @param {string} baseQuery - Query SQL base 
 * @param {string} tableAlias - Alias de la tabla principal (ej: 'c' para campaign)
 * @param {string} profileJoinField - Campo que conecta con profile (ej: 'c.profile_id' o 'l.profile_id')
 * @param {Object} tenantContext - Contexto del tenant
 * @param {Array} params - Parámetros de la query
 * @returns {Object} - Query modificada y parámetros actualizados
 */
export function addTenantFilter(baseQuery, tableAlias, profileJoinField, tenantContext, params = []) {
  // Si es superuser, no aplicar filtro (puede ver todo)
  if (tenantContext.is_superuser) {
    return {
      query: baseQuery,
      params: params
    };
  }

  // Si no tiene tenant, no puede ver nada
  if (!tenantContext.tenant_id) {
    return {
      query: baseQuery + ` WHERE 1=0`, // Query que no retorna nada
      params: params
    };
  }

  // Determinar si necesitamos agregar JOINs
  const needsProfileJoin = !baseQuery.toLowerCase().includes('join profile') && 
                          !baseQuery.toLowerCase().includes('from profile');
  const needsTenantJoin = !baseQuery.toLowerCase().includes('join tenant_members') && 
                         !baseQuery.toLowerCase().includes('from tenant_members');

  let modifiedQuery = baseQuery;

  // Agregar JOINs si son necesarios
  if (needsProfileJoin) {
    modifiedQuery += ` JOIN profile p ON ${profileJoinField} = p.id`;
  }
  if (needsTenantJoin) {
    modifiedQuery += ` JOIN tenant_members tm ON p.id = tm.user_id`;
  }

  // Agregar filtro de tenant
  const whereClause = modifiedQuery.toLowerCase().includes('where') 
    ? ` AND tm.tenant_id = $${params.length + 1}`
    : ` WHERE tm.tenant_id = $${params.length + 1}`;

  return {
    query: modifiedQuery + whereClause,
    params: [...params, tenantContext.tenant_id]
  };
}

/**
 * Versión simplificada para queries que ya tienen los JOINs correctos
 * @param {string} baseQuery - Query SQL base que ya incluye los JOINs necesarios
 * @param {Object} tenantContext - Contexto del tenant
 * @param {Array} params - Parámetros de la query
 * @returns {Object} - Query modificada y parámetros actualizados
 */
export function addTenantFilterSimple(baseQuery, tenantContext, params = []) {
  // Si es superuser, no aplicar filtro (puede ver todo)
  if (tenantContext.is_superuser) {
    return {
      query: baseQuery,
      params: params
    };
  }

  // Si no tiene tenant, no puede ver nada
  if (!tenantContext.tenant_id) {
    return {
      query: baseQuery + ` WHERE 1=0`,
      params: params
    };
  }

  // Agregar filtro de tenant (asume que ya existe tm.tenant_id en la query)
  const whereClause = baseQuery.toLowerCase().includes('where') 
    ? ` AND tm.tenant_id = $${params.length + 1}`
    : ` WHERE tm.tenant_id = $${params.length + 1}`;

  return {
    query: baseQuery + whereClause,
    params: [...params, tenantContext.tenant_id]
  };
}

/**
 * Verifica si el usuario tiene acceso a un recurso específico de un tenant
 * @param {Object} tenantContext - Contexto del tenant
 * @param {string} resourceTenantId - ID del tenant del recurso
 * @returns {boolean} - Si tiene acceso o no
 */
export function hasAccessToResource(tenantContext, resourceTenantId) {
  // Superuser puede acceder a todo
  if (tenantContext.is_superuser) {
    return true;
  }

  // Usuario regular solo puede acceder a recursos de su tenant
  return tenantContext.tenant_id === resourceTenantId;
}

/**
 * Wrapper para endpoints que requieren aislamiento de tenant
 * @param {Function} handler - Función del endpoint
 * @returns {Function} - Endpoint protegido
 */
export function withTenantIsolation(handler) {
  return defineEventHandler(async (event) => {
    try {
      // Obtener contexto de tenant
      const tenantContext = await getTenantContext(event);
      
      // Agregar contexto al event para uso en el handler
      event.context.tenant = tenantContext;
      
      // Ejecutar handler original
      return await handler(event);
      
    } catch (error) {
      console.error('Error en tenant isolation:', error);
      throw error;
    }
  });
}

/**
 * Helper para queries que necesitan filtro de tenant automático
 * @param {H3Event} event - Event con contexto de tenant
 * @param {Function} queryFunction - Función que ejecuta la query
 * @returns {Promise<any>} - Resultado de la query
 */
export async function executeWithTenantFilter(event, queryFunction) {
  if (!event.context.tenant) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Contexto de tenant no inicializado'
    });
  }

  return await queryFunction(event.context.tenant);
}