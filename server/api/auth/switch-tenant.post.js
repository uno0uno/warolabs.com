// server/api/auth/switch-tenant.post.js

import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient'
import { v4 as uuidv4 } from 'uuid'

/**
 * API endpoint para cambiar de tenant activo
 * POST /api/auth/switch-tenant
 * Body: { tenantSlug: string }
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { tenantSlug } = body
    
    if (!tenantSlug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tenant slug is required'
      })
    }

    // Obtener sesión actual
    const currentSessionToken = getCookie(event, 'session-token')
    
    if (!currentSessionToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No session found'
      })
    }

    const result = await withPostgresClient(async (client) => {
      // Validar sesión actual y obtener user_id
      const currentSessionQuery = `
        SELECT s.user_id, s.ip_address, s.user_agent, s.login_method
        FROM sessions s
        WHERE s.id = $1 
          AND s.expires_at > NOW()
          AND s.is_active = true
        LIMIT 1
      `
      const currentSessionResult = await client.query(currentSessionQuery, [currentSessionToken])
      
      if (currentSessionResult.rows.length === 0) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid session'
        })
      }
      
      const { user_id, ip_address, user_agent, login_method } = currentSessionResult.rows[0]
      
      // Validar que el usuario tiene acceso al tenant solicitado
      const tenantAccessQuery = `
        SELECT t.id, t.name, t.slug
        FROM tenants t
        INNER JOIN tenant_members tm ON t.id = tm.tenant_id
        WHERE t.slug = $1 AND tm.user_id = $2
        LIMIT 1
      `
      const tenantAccessResult = await client.query(tenantAccessQuery, [tenantSlug, user_id])
      
      if (tenantAccessResult.rows.length === 0) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Access denied to this tenant'
        })
      }
      
      const tenant = tenantAccessResult.rows[0]
      
      // Terminar sesión actual
      await client.query(
        `UPDATE sessions SET is_active = false, ended_at = NOW(), end_reason = 'tenant_switch' WHERE id = $1`,
        [currentSessionToken]
      )
      
      // Crear nueva sesión con el nuevo tenant
      const newSessionId = uuidv4()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
      
      await client.query(`
        INSERT INTO sessions (
          id, user_id, tenant_id, expires_at, ip_address, 
          user_agent, login_method, is_active, created_at, last_activity_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
      `, [
        newSessionId, 
        user_id, 
        tenant.id, 
        expiresAt, 
        ip_address, 
        user_agent, 
        login_method
      ])
      
      console.log(`🔄 Usuario ${user_id} cambió a tenant: ${tenant.name} (${tenant.slug})`)
      
      return {
        sessionId: newSessionId,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug
        },
        expiresAt
      }
    }, event)

    // Establecer nueva cookie de sesión
    setCookie(event, 'session-token', result.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: result.expiresAt,
      path: '/'
    })

    return {
      success: true,
      message: 'Tenant switched successfully',
      tenant: result.tenant,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('Error switching tenant:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Error interno del servidor',
      message: error.message || 'No se pudo cambiar de tenant'
    })
  }
})