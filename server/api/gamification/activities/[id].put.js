import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    const activityId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { 
      activity_name,
      activity_description,
      waro_points,
      activity_type,
      frequency_type,
      target_value,
      measurement_unit,
      is_active
    } = body
    
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
      
      // Update activity
      const result = await client.query(`
        UPDATE gamification_activities 
        SET 
          activity_name = COALESCE($1, activity_name),
          activity_description = COALESCE($2, activity_description),
          waro_points = COALESCE($3, waro_points),
          activity_type = COALESCE($4, activity_type),
          frequency_type = COALESCE($5, frequency_type),
          target_value = COALESCE($6, target_value),
          measurement_unit = COALESCE($7, measurement_unit),
          is_active = COALESCE($8, is_active),
          updated_at = NOW()
        WHERE id = $9 AND tenant_id = $10
        RETURNING *
      `, [
        activity_name,
        activity_description,
        waro_points,
        activity_type,
        frequency_type,
        target_value,
        measurement_unit,
        is_active,
        activityId,
        tenantContext.tenant_id
      ])
      
      return {
        message: 'Actividad actualizada exitosamente',
        activity: result.rows[0]
      }
    }, event)
  })
})