import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    return await withPostgresClient(async (client) => {
      
      // Get evaluation criteria for the tenant with activity and module info
      const result = await client.query(`
        SELECT 
          ec.*,
          ga.activity_name,
          ga.base_waros,
          gm.module_name,
          gm.waro_multiplier
        FROM evaluation_criteria ec
        JOIN gamification_activities ga ON ec.activity_id = ga.id
        JOIN gamification_modules gm ON ga.module_id = gm.id
        WHERE ec.tenant_id = $1
        ORDER BY ec.evaluation_type, ec.created_at DESC
      `, [tenantContext.tenant_id])
      
      return result.rows
    }, event)
  })
})