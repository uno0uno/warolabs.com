import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    // Only superusers can access global config
    if (!tenantContext.is_superuser) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Solo superusuarios pueden acceder a la configuración global'
      })
    }
    
    return await withPostgresClient(async (client) => {
      
      // Get default global configuration (we can use any tenant's config as template)
      const result = await client.query(`
        SELECT 
          waro_base_value,
          max_daily_waros,
          max_weekly_waros,
          max_level,
          level_system_enabled,
          waros_per_level,
          level_multiplier
        FROM gamification_config 
        LIMIT 1
      `)
      
      if (result.rows.length === 0) {
        // Return default values if no config exists
        return {
          waro_base_value: 1,
          max_daily_waros: 1000,
          max_weekly_waros: 5000,
          max_level: 50,
          level_system_enabled: true,
          waros_per_level: 100,
          level_multiplier: 1.5
        }
      }
      
      return result.rows[0]
    }, event)
  })
})