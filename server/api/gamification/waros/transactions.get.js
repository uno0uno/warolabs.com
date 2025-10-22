import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    const query = getQuery(event)
    const { 
      profile_id, 
      limit = 50, 
      offset = 0,
      transaction_type,
      start_date,
      end_date
    } = query
    
    return await withPostgresClient(async (client) => {
      
      let whereConditions = ['wt.tenant_id = $1']
      let params = [tenantContext.tenant_id]
      let paramIndex = 2
      
      // Add profile filter if specified
      if (profile_id) {
        whereConditions.push(`wt.profile_id = $${paramIndex}`)
        params.push(profile_id)
        paramIndex++
      }
      
      // Add transaction type filter if specified
      if (transaction_type) {
        whereConditions.push(`wt.transaction_type = $${paramIndex}`)
        params.push(transaction_type)
        paramIndex++
      }
      
      // Add date range filters
      if (start_date) {
        whereConditions.push(`wt.created_at >= $${paramIndex}`)
        params.push(start_date)
        paramIndex++
      }
      
      if (end_date) {
        whereConditions.push(`wt.created_at <= $${paramIndex}`)
        params.push(end_date)
        paramIndex++
      }
      
      // Build the query
      const whereClause = whereConditions.join(' AND ')
      
      // Get transactions with activity and profile information
      const result = await client.query(`
        SELECT 
          wt.*,
          ga.activity_name,
          ga.module_id,
          gm.module_name,
          p.name as profile_name,
          p.logo_avatar as profile_avatar
        FROM waros_transactions wt
        LEFT JOIN gamification_activities ga ON wt.activity_id = ga.id
        LEFT JOIN gamification_modules gm ON ga.module_id = gm.id
        LEFT JOIN profiles p ON wt.profile_id = p.user_id
        WHERE ${whereClause}
        ORDER BY wt.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...params, limit, offset])
      
      // Get total count for pagination
      const countResult = await client.query(`
        SELECT COUNT(*) as total
        FROM waros_transactions wt
        WHERE ${whereClause}
      `, params)
      
      const total = parseInt(countResult.rows[0].total)
      
      return {
        transactions: result.rows,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + parseInt(limit)) < total
        }
      }
    }, event)
  })
})