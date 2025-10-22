import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    // Only superusers can access admin stats
    if (!tenantContext.is_superuser) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Solo superusuarios pueden acceder a las estadísticas del sistema'
      })
    }
    
    return await withPostgresClient(async (client) => {
      
      // Get active tenants count
      const tenantsResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM tenants 
        WHERE created_at > NOW() - INTERVAL '1 year'
      `)
      
      // Get base modules count
      const modulesResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM gamification_modules 
        WHERE module_type = 'base' AND is_active = true
      `)
      
      // Get active users count (users with recent activity)
      const usersResult = await client.query(`
        SELECT COUNT(DISTINCT ww.profile_id) as count
        FROM waros_wallets ww
        JOIN waros_transactions wt ON ww.profile_id = wt.profile_id
        WHERE wt.created_at > NOW() - INTERVAL '30 days'
      `)
      
      // Get total Waros in circulation
      const warosResult = await client.query(`
        SELECT SUM(current_balance) as total
        FROM waros_wallets
      `)
      
      // Get tenant details with stats
      const tenantsDetails = await client.query(`
        SELECT 
          t.id,
          t.name,
          t.slug,
          t.created_at,
          COUNT(DISTINCT tm.user_id) as user_count,
          COUNT(DISTINCT gm.id) as active_modules,
          COALESCE(SUM(ww.current_balance), 0) as total_waros,
          CASE WHEN COUNT(DISTINCT tm.user_id) > 0 THEN true ELSE false END as is_active
        FROM tenants t
        LEFT JOIN tenant_members tm ON t.id = tm.tenant_id
        LEFT JOIN gamification_modules gm ON t.id = gm.tenant_id AND gm.is_active = true
        LEFT JOIN waros_wallets ww ON t.id = ww.tenant_id
        GROUP BY t.id, t.name, t.slug, t.created_at
        ORDER BY total_waros DESC
      `)
      
      // Get top performing tenants by monthly activity
      const topTenants = await client.query(`
        SELECT 
          t.name,
          COUNT(DISTINCT wt.profile_id) as active_users,
          SUM(CASE WHEN wt.waros_amount > 0 THEN wt.waros_amount ELSE 0 END) as monthly_waros
        FROM tenants t
        JOIN waros_transactions wt ON t.id = wt.tenant_id
        WHERE wt.created_at > NOW() - INTERVAL '30 days'
        GROUP BY t.id, t.name
        ORDER BY monthly_waros DESC
        LIMIT 10
      `)
      
      return {
        stats: {
          activeTenants: parseInt(tenantsResult.rows[0]?.count || 0),
          baseModules: parseInt(modulesResult.rows[0]?.count || 0),
          activeUsers: parseInt(usersResult.rows[0]?.count || 0),
          totalWaros: parseInt(warosResult.rows[0]?.total || 0)
        },
        tenants: tenantsDetails.rows,
        topTenants: topTenants.rows
      }
    }, event)
  })
})