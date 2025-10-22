import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    // Only superusers can update global config
    if (!tenantContext.is_superuser) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Solo superusuarios pueden actualizar la configuración global'
      })
    }
    
    const body = await readBody(event)
    const { 
      waro_base_value,
      max_daily_waros,
      max_weekly_waros,
      max_level,
      level_system_enabled,
      waros_per_level,
      level_multiplier
    } = body
    
    return await withPostgresClient(async (client) => {
      
      // Update all tenant configurations with new global defaults
      const updateQuery = `
        UPDATE gamification_config 
        SET 
          waro_base_value = COALESCE($1, waro_base_value),
          max_daily_waros = COALESCE($2, max_daily_waros),
          max_weekly_waros = COALESCE($3, max_weekly_waros),
          max_level = COALESCE($4, max_level),
          level_system_enabled = COALESCE($5, level_system_enabled),
          waros_per_level = COALESCE($6, waros_per_level),
          level_multiplier = COALESCE($7, level_multiplier),
          updated_at = NOW()
        WHERE tenant_id IS NOT NULL
        RETURNING *
      `
      
      const result = await client.query(updateQuery, [
        waro_base_value,
        max_daily_waros,
        max_weekly_waros,
        max_level,
        level_system_enabled,
        waros_per_level,
        level_multiplier
      ])
      
      return {
        message: 'Configuración global actualizada exitosamente',
        affected_tenants: result.rows.length,
        updated_config: {
          waro_base_value,
          max_daily_waros,
          max_weekly_waros,
          max_level,
          level_system_enabled,
          waros_per_level,
          level_multiplier
        }
      }
    }, event)
  })
})