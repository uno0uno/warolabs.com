import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    return await withPostgresClient(async (client) => {
      
      // Get available marketplace items for the tenant
      const result = await client.query(`
        SELECT 
          mi.*,
          COUNT(mp.id) as total_purchases
        FROM marketplace_items mi
        LEFT JOIN marketplace_purchases mp ON mi.id = mp.item_id
        WHERE mi.tenant_id = $1 AND mi.is_available = true
        GROUP BY mi.id
        ORDER BY mi.item_category, mi.waro_cost ASC
      `, [tenantContext.tenant_id])
      
      return result.rows
    }, event)
  })
})