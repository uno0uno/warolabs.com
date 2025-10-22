import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    const achievementId = getRouterParam(event, 'id')
    
    return await withPostgresClient(async (client) => {
      
      // Verify the achievement belongs to this tenant
      const achievementCheck = await client.query(`
        SELECT id FROM achievements 
        WHERE id = $1 AND tenant_id = $2
      `, [achievementId, tenantContext.tenant_id])
      
      if (achievementCheck.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Logro no encontrado o no pertenece a este tenant'
        })
      }
      
      // Soft delete by setting is_active to false
      const result = await client.query(`
        UPDATE achievements 
        SET is_active = false, updated_at = NOW()
        WHERE id = $1 AND tenant_id = $2
        RETURNING *
      `, [achievementId, tenantContext.tenant_id])
      
      return {
        message: 'Logro eliminado exitosamente',
        achievement: result.rows[0]
      }
    }, event)
  })
})