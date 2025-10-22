import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    const body = await readBody(event)
    const { confirm_deletion } = body
    
    // Safety check - require explicit confirmation
    if (!confirm_deletion) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Debe confirmar la eliminación con confirm_deletion: true'
      })
    }
    
    return await withPostgresClient(async (client) => {
      
      // Start transaction
      await client.query('BEGIN')
      
      try {
        const tenantId = tenantContext.tenant_id
        
        // Delete in reverse order of dependencies
        
        // 1. Delete evaluation_results
        const evaluationResultsResult = await client.query(`
          DELETE FROM evaluation_results 
          WHERE tenant_id = $1
          RETURNING id
        `, [tenantId])
        
        // 2. Delete evaluation_criteria  
        const evaluationCriteriaResult = await client.query(`
          DELETE FROM evaluation_criteria 
          WHERE tenant_id = $1
          RETURNING id
        `, [tenantId])
        
        // 3. Delete waros_transactions
        const transactionsResult = await client.query(`
          DELETE FROM waros_transactions 
          WHERE tenant_id = $1
          RETURNING id
        `, [tenantId])
        
        // 4. Delete waros_wallets
        const walletsResult = await client.query(`
          DELETE FROM waros_wallets 
          WHERE tenant_id = $1
          RETURNING id
        `, [tenantId])
        
        // 5. Delete user_achievements
        const userAchievementsResult = await client.query(`
          DELETE FROM user_achievements 
          WHERE tenant_id = $1
          RETURNING id
        `, [tenantId])
        
        // 6. Delete achievements
        const achievementsResult = await client.query(`
          DELETE FROM achievements 
          WHERE tenant_id = $1
          RETURNING id
        `, [tenantId])
        
        // 7. Delete gamification_activities
        const activitiesResult = await client.query(`
          DELETE FROM gamification_activities 
          WHERE tenant_id = $1
          RETURNING id
        `, [tenantId])
        
        // 8. Delete gamification_modules
        const modulesResult = await client.query(`
          DELETE FROM gamification_modules 
          WHERE tenant_id = $1
          RETURNING id
        `, [tenantId])
        
        // 9. Delete tenant_investments
        const investmentsResult = await client.query(`
          DELETE FROM tenant_investments 
          WHERE tenant_id = $1
          RETURNING id
        `, [tenantId])
        
        // 10. Delete test orders (be careful with this one)
        const ordersResult = await client.query(`
          DELETE FROM orders 
          WHERE tenant_id = $1 
          AND status = 'completed' 
          AND created_at >= '2025-10-09'
          RETURNING id
        `, [tenantId])
        
        // Commit transaction
        await client.query('COMMIT')
        
        return {
          message: 'Datos de prueba eliminados exitosamente',
          deleted_records: {
            evaluation_results: evaluationResultsResult.rows.length,
            evaluation_criteria: evaluationCriteriaResult.rows.length,
            waros_transactions: transactionsResult.rows.length,
            waros_wallets: walletsResult.rows.length,
            user_achievements: userAchievementsResult.rows.length,
            achievements: achievementsResult.rows.length,
            gamification_activities: activitiesResult.rows.length,
            gamification_modules: modulesResult.rows.length,
            tenant_investments: investmentsResult.rows.length,
            test_orders: ordersResult.rows.length
          }
        }
        
      } catch (error) {
        // Rollback transaction
        await client.query('ROLLBACK')
        throw error
      }
    }, event)
  })
})