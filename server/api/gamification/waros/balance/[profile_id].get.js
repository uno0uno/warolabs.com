import { withTenantIsolation, executeWithTenantFilter } from '../../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    const profileId = getRouterParam(event, 'profile_id')
    
    if (!profileId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'profile_id es requerido'
      })
    }
    
    return await withPostgresClient(async (client) => {
      
      // Get wallet balance
      const walletResult = await client.query(`
        SELECT 
          ww.*,
          p.name as profile_name,
          p.logo_avatar as profile_avatar
        FROM waros_wallets ww
        LEFT JOIN profile p ON ww.profile_id = p.id
        WHERE ww.profile_id = $1 AND ww.tenant_id = $2
      `, [profileId, tenantContext.tenant_id])
      
      if (walletResult.rows.length === 0) {
        // Create wallet if it doesn't exist
        const newWalletResult = await client.query(`
          INSERT INTO waros_wallets (profile_id, tenant_id, current_balance, created_at, updated_at)
          VALUES ($1, $2, 0, NOW(), NOW())
          RETURNING *
        `, [profileId, tenantContext.tenant_id])
        
        return {
          wallet: newWalletResult.rows[0],
          profile_name: null,
          profile_avatar: null,
          stats: {
            total_earned: 0,
            total_spent: 0,
            transaction_count: 0,
            achievements_count: 0
          }
        }
      }
      
      const wallet = walletResult.rows[0]
      
      // Get user stats
      const statsResult = await client.query(`
        SELECT 
          SUM(CASE WHEN transaction_type IN ('earned', 'bonus') THEN waros_amount ELSE 0 END) as total_earned,
          SUM(CASE WHEN transaction_type = 'spent' THEN waros_amount ELSE 0 END) as total_spent,
          COUNT(*) as transaction_count
        FROM waros_transactions
        WHERE profile_id = $1 AND tenant_id = $2
      `, [profileId, tenantContext.tenant_id])
      
      // Get achievements count
      const achievementsResult = await client.query(`
        SELECT COUNT(*) as achievements_count
        FROM user_achievements
        WHERE profile_id = $1 AND tenant_id = $2
      `, [profileId, tenantContext.tenant_id])
      
      const stats = statsResult.rows[0]
      const achievementsCount = parseInt(achievementsResult.rows[0].achievements_count)
      
      return {
        wallet,
        profile_name: wallet.profile_name,
        profile_avatar: wallet.profile_avatar,
        stats: {
          total_earned: parseInt(stats.total_earned || 0),
          total_spent: parseInt(stats.total_spent || 0),
          transaction_count: parseInt(stats.transaction_count || 0),
          achievements_count: achievementsCount
        }
      }
    }, event)
  })
})