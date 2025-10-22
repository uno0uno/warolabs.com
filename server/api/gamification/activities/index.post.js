import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    const body = await readBody(event)
    const { 
      module_id,
      activity_name,
      activity_description,
      waro_points,
      activity_type,
      frequency_type,
      target_value,
      measurement_unit,
      is_active
    } = body
    
    // Validate required fields
    if (!module_id || !activity_name || !waro_points) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Los campos module_id, activity_name y waro_points son requeridos'
      })
    }
    
    return await withPostgresClient(async (client) => {
      
      // Verify the module belongs to this tenant
      const moduleCheck = await client.query(`
        SELECT id FROM gamification_modules 
        WHERE id = $1 AND tenant_id = $2
      `, [module_id, tenantContext.tenant_id])
      
      if (moduleCheck.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Módulo no encontrado o no pertenece a este tenant'
        })
      }
      
      // Insert new activity
      const result = await client.query(`
        INSERT INTO gamification_activities (
          tenant_id, module_id, activity_name, activity_description,
          base_waros, bonus_waros, max_daily_times, max_weekly_times,
          requires_validation, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        RETURNING *
      `, [
        tenantContext.tenant_id,
        module_id,
        activity_name,
        activity_description || '',
        waro_points || 10,
        0, // bonus_waros
        null, // max_daily_times
        null, // max_weekly_times
        false, // requires_validation
        is_active !== false
      ])
      
      return {
        message: 'Actividad creada exitosamente',
        activity: result.rows[0]
      }
    }, event)
  })
})