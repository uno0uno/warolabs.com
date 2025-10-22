import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    return await withPostgresClient(async (client) => {
      
      // Get activities for the tenant, with module information
      const result = await client.query(`
        SELECT 
          ga.*,
          gm.module_name,
          gm.module_key,
          gm.module_type,
          gm.waro_multiplier as module_multiplier
        FROM gamification_activities ga
        JOIN gamification_modules gm ON ga.module_id = gm.id
        WHERE ga.tenant_id = $1
        ORDER BY gm.module_name, ga.activity_name
      `, [tenantContext.tenant_id])
      
      return result.rows
    }, event)
  })
})