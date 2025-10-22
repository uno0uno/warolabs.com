import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    const moduleId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { 
      module_name, 
      module_description, 
      waro_multiplier,
      is_active 
    } = body
    
    if (!moduleId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID del módulo requerido'
      })
    }
    
    return await withPostgresClient(async (client) => {
      // First, check if the module exists and user has permission to edit it
      let checkQuery = `
        SELECT * FROM gamification_modules 
        WHERE id = $1
      `
      let checkParams = [moduleId]
      
      // Non-superusers can only edit modules from their tenant
      if (!tenantContext.is_superuser) {
        checkQuery += ` AND tenant_id = $2`
        checkParams.push(tenantContext.tenant_id)
      }
      
      const checkResult = await client.query(checkQuery, checkParams)
      
      if (checkResult.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Módulo no encontrado o sin permisos para editarlo'
        })
      }
      
      // Build dynamic update query
      const updates = []
      const values = []
      let paramCount = 1
      
      if (module_name !== undefined) {
        updates.push(`module_name = $${paramCount}`)
        values.push(module_name)
        paramCount++
      }
      
      if (module_description !== undefined) {
        updates.push(`module_description = $${paramCount}`)
        values.push(module_description)
        paramCount++
      }
      
      if (waro_multiplier !== undefined) {
        updates.push(`waro_multiplier = $${paramCount}`)
        values.push(waro_multiplier)
        paramCount++
      }
      
      if (is_active !== undefined) {
        updates.push(`is_active = $${paramCount}`)
        values.push(is_active)
        paramCount++
      }
      
      if (updates.length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'No hay campos para actualizar'
        })
      }
      
      // Add updated_at timestamp
      updates.push(`updated_at = NOW()`)
      values.push(moduleId)
      
      const updateQuery = `
        UPDATE gamification_modules 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `
      
      const result = await client.query(updateQuery, values)
      return result.rows[0]
    }, event)
  })
})