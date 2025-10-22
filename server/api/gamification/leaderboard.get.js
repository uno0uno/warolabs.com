import { withTenantIsolation, executeWithTenantFilter } from '../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    const query = getQuery(event)
    const { 
      period = 'all_time', // all_time, monthly, weekly, daily
      limit = 20,
      module_id
    } = query
    
    return await withPostgresClient(async (client) => {
      
      // Build time filter based on period
      let timeFilter = ''
      switch (period) {
        case 'daily':
          timeFilter = "AND wt.created_at >= CURRENT_DATE"
          break
        case 'weekly':
          timeFilter = "AND wt.created_at >= DATE_TRUNC('week', CURRENT_DATE)"
          break
        case 'monthly':
          timeFilter = "AND wt.created_at >= DATE_TRUNC('month', CURRENT_DATE)"
          break
        case 'all_time':
        default:
          timeFilter = ''
          break
      }
      
      // Build module filter if specified
      let moduleFilter = ''
      let moduleJoin = ''
      if (module_id) {
        moduleJoin = 'LEFT JOIN gamification_activities ga ON wt.activity_id = ga.id'
        moduleFilter = `AND ga.module_id = ${parseInt(module_id)}`
      }
      
      // Get leaderboard data
      const result = await client.query(`
        SELECT 
          wt.profile_id,
          p.name as profile_name,
          p.logo_avatar as profile_avatar,
          SUM(CASE WHEN wt.transaction_type IN ('earned', 'bonus') THEN wt.waros_amount ELSE 0 END) as total_waros,
          COUNT(CASE WHEN wt.transaction_type = 'earned' THEN 1 END) as activities_completed,
          COUNT(DISTINCT ua.achievement_id) as achievements_earned,
          MAX(wt.created_at) as last_activity,
          ROW_NUMBER() OVER (ORDER BY SUM(CASE WHEN wt.transaction_type IN ('earned', 'bonus') THEN wt.waros_amount ELSE 0 END) DESC) as rank
        FROM waros_transactions wt
        ${moduleJoin}
        LEFT JOIN profiles p ON wt.profile_id = p.user_id
        LEFT JOIN user_achievements ua ON wt.profile_id = ua.profile_id AND ua.tenant_id = wt.tenant_id
        WHERE wt.tenant_id = $1 ${timeFilter} ${moduleFilter}
        GROUP BY wt.profile_id, p.name, p.logo_avatar
        HAVING SUM(CASE WHEN wt.transaction_type IN ('earned', 'bonus') THEN wt.waros_amount ELSE 0 END) > 0
        ORDER BY total_waros DESC
        LIMIT $2
      `, [tenantContext.tenant_id, limit])
      
      // Get period stats
      const periodStatsResult = await client.query(`
        SELECT 
          COUNT(DISTINCT wt.profile_id) as active_users,
          SUM(CASE WHEN wt.transaction_type IN ('earned', 'bonus') THEN wt.waros_amount ELSE 0 END) as total_waros_distributed,
          COUNT(CASE WHEN wt.transaction_type = 'earned' THEN 1 END) as total_activities,
          COUNT(DISTINCT ua.achievement_id) as total_achievements_earned
        FROM waros_transactions wt
        ${moduleJoin}
        LEFT JOIN user_achievements ua ON wt.profile_id = ua.profile_id AND ua.tenant_id = wt.tenant_id ${timeFilter ? timeFilter.replace('wt.created_at', 'ua.earned_date') : ''}
        WHERE wt.tenant_id = $1 ${timeFilter} ${moduleFilter}
      `, [tenantContext.tenant_id])
      
      const periodStats = periodStatsResult.rows[0]
      
      // Get module info if filtering by module
      let moduleInfo = null
      if (module_id) {
        const moduleResult = await client.query(`
          SELECT module_name, module_key, module_description
          FROM gamification_modules
          WHERE id = $1 AND tenant_id = $2
        `, [module_id, tenantContext.tenant_id])
        
        moduleInfo = moduleResult.rows[0] || null
      }
      
      return {
        leaderboard: result.rows,
        period,
        module_info: moduleInfo,
        stats: {
          active_users: parseInt(periodStats.active_users || 0),
          total_waros_distributed: parseInt(periodStats.total_waros_distributed || 0),
          total_activities: parseInt(periodStats.total_activities || 0),
          total_achievements_earned: parseInt(periodStats.total_achievements_earned || 0)
        },
        generated_at: new Date().toISOString()
      }
    }, event)
  })
})