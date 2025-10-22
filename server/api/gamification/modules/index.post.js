import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    const body = await readBody(event)
    const { 
      module_name, 
      module_description, 
      module_type = 'custom',
      waro_multiplier = 1.0,
      is_active = true,
      tenant_id = null 
    } = body
    
    // Validate required fields
    if (!module_name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'module_name es requerido'
      })
    }
    
    return await withPostgresClient(async (client) => {
      // Determine target tenant
      let targetTenantId = tenantContext.tenant_id
      
      // Only superusers can create base modules or modules for other tenants
      if (tenantContext.is_superuser) {
        if (module_type === 'base') {
          // Base modules are global (no tenant_id)
          targetTenantId = null
        } else if (tenant_id) {
          // Superuser can specify a different tenant
          targetTenantId = tenant_id
        }
      } else if (module_type === 'base') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Solo superusuarios pueden crear módulos base'
        })
      }
      
      try {
        const result = await client.query(`
          INSERT INTO gamification_modules (
            tenant_id, module_name, module_description, 
            module_type, waro_multiplier, is_active, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `, [
          targetTenantId,
          module_name,
          module_description,
          module_type,
          waro_multiplier,
          is_active,
          tenantContext.user_id
        ])
        
        return result.rows[0]
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw createError({
            statusCode: 409,
            statusMessage: 'Ya existe un módulo con ese nombre en este tenant'
          })
        }
        throw error
      }
    }, event)
  })
})