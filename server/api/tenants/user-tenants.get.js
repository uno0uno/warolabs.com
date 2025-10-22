// server/api/tenants/user-tenants.get.js

import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient'

/**
 * API endpoint para obtener los tenants asociados al usuario actual
 * GET /api/tenants/user-tenants
 */
export default defineEventHandler(async (event) => {
  try {
    // Obtener información del usuario desde la sesión
    const sessionToken = getCookie(event, 'session-token')
    
    if (!sessionToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No session found'
      })
    }

    const result = await withPostgresClient(async (client) => {
      // Primero verificar la sesión y obtener el user_id
      const sessionQuery = `
        SELECT s.user_id 
        FROM sessions s
        WHERE s.id = $1 
          AND s.expires_at > NOW()
          AND s.is_active = true
        LIMIT 1
      `
      const sessionResult = await client.query(sessionQuery, [sessionToken])
      
      if (sessionResult.rows.length === 0) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid session'
        })
      }
      
      const userId = sessionResult.rows[0].user_id
      
      // Obtener los tenants del usuario
      const query = `
        SELECT DISTINCT 
          t.id,
          t.name,
          t.slug
        FROM tenants t
        INNER JOIN tenant_members tm ON t.id = tm.tenant_id
        WHERE tm.user_id = $1
        ORDER BY t.name
      `

      const tenants = await client.query(query, [userId])
      
      console.log(`📋 Tenants encontrados para usuario ${userId}:`, tenants.rows.length)
      
      return tenants.rows.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug
      }))
    }, event)

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('Error fetching user tenants:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor',
      message: 'No se pudieron obtener los tenants del usuario'
    })
  }
})