import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    return await withPostgresClient(async (client) => {
      
      // Get achievements for the tenant, with module information
      const result = await client.query(`
        SELECT 
          a.*,
          gm.module_name,
          gm.module_type,
          COUNT(ua.id) as earned_count
        FROM achievements a
        LEFT JOIN gamification_modules gm ON (a.unlock_criteria->>'module_id')::integer = gm.id
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id
        WHERE a.tenant_id = $1
        GROUP BY a.id, gm.module_name, gm.module_type
        ORDER BY a.rarity, a.achievement_name
      `, [tenantContext.tenant_id])
      
      return result.rows
    }, event)
  })
})