import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    return await withPostgresClient(async (client) => {
      
      // Admin users can see all modules, regular users only see their tenant's modules
      let query = `
        SELECT 
          gm.*,
          COUNT(ga.id) as activity_count
        FROM gamification_modules gm
        LEFT JOIN gamification_activities ga ON gm.id = ga.module_id AND ga.is_active = true
      `
      let params = []
      
      if (tenantContext.is_superuser) {
        // Superuser sees all modules across all tenants
        query += ` GROUP BY gm.id ORDER BY gm.created_at DESC`
      } else {
        // Regular users only see modules for their tenant
        query += ` WHERE gm.tenant_id = $1 GROUP BY gm.id ORDER BY gm.created_at DESC`
        params = [tenantContext.tenant_id]
      }
      
      const result = await client.query(query, params)
      
      return result.rows
    }, event)
  })
})