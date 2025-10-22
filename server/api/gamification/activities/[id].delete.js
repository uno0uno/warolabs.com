import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    const activityId = getRouterParam(event, 'id')
    
    return await withPostgresClient(async (client) => {
      
      // Verify the activity belongs to this tenant
      const activityCheck = await client.query(`
        SELECT id FROM gamification_activities 
        WHERE id = $1 AND tenant_id = $2
      `, [activityId, tenantContext.tenant_id])
      
      if (activityCheck.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Actividad no encontrada o no pertenece a este tenant'
        })
      }
      
      // Instead of hard delete, soft delete by setting is_active to false
      const result = await client.query(`
        UPDATE gamification_activities 
        SET is_active = false, updated_at = NOW()
        WHERE id = $1 AND tenant_id = $2
        RETURNING *
      `, [activityId, tenantContext.tenant_id])
      
      return {
        message: 'Actividad eliminada exitosamente',
        activity: result.rows[0]
      }
    }, event)
  })
})