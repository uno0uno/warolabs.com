import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    const body = await readBody(event)
    const { 
      profile_id,
      activity_id,
      description,
      metadata
    } = body
    
    // Validate required fields
    if (!profile_id || !activity_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Los campos profile_id y activity_id son requeridos'
      })
    }
    
    return await withPostgresClient(async (client) => {
      
      // Start transaction
      await client.query('BEGIN')
      
      try {
        // Verify the activity belongs to this tenant and get all needed data
        const activityResult = await client.query(`
          SELECT 
            ga.id, 
            ga.activity_name, 
            ga.base_waros, 
            ga.module_id,
            gm.waro_multiplier as module_multiplier
          FROM gamification_activities ga
          JOIN gamification_modules gm ON ga.module_id = gm.id
          WHERE ga.id = $1 AND ga.tenant_id = $2 AND ga.is_active = true
        `, [activity_id, tenantContext.tenant_id])
        
        if (activityResult.rows.length === 0) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Actividad no encontrada o no pertenece a este tenant'
          })
        }
        
        const activity = activityResult.rows[0]
        
        // Calculate final waros amount (activity base_waros * module multiplier)
        const baseWaros = activity.base_waros || 10
        const moduleMultiplier = activity.module_multiplier || 1
        const finalWarosAmount = Math.round(baseWaros * moduleMultiplier)
        
        // Check if user wallet exists
        let walletResult = await client.query(`
          SELECT id, current_balance FROM waros_wallets 
          WHERE profile_id = $1 AND tenant_id = $2
        `, [profile_id, tenantContext.tenant_id])
        
        let walletId
        let currentBalance = 0
        
        if (walletResult.rows.length === 0) {
          // Create wallet if it doesn't exist
          const newWalletResult = await client.query(`
            INSERT INTO waros_wallets (profile_id, tenant_id, current_balance, created_at, updated_at)
            VALUES ($1, $2, 0, NOW(), NOW())
            RETURNING id, current_balance
          `, [profile_id, tenantContext.tenant_id])
          
          walletId = newWalletResult.rows[0].id
          currentBalance = 0
        } else {
          walletId = walletResult.rows[0].id
          currentBalance = walletResult.rows[0].current_balance
        }
        
        // Create transaction record
        const transactionResult = await client.query(`
          INSERT INTO waros_transactions (
            profile_id, tenant_id, transaction_type, waros_amount,
            balance_after, activity_id, description, metadata,
            created_at
          ) VALUES ($1, $2, 'earned', $3, $4, $5, $6, $7, NOW())
          RETURNING *
        `, [
          profile_id,
          tenantContext.tenant_id,
          finalWarosAmount,
          currentBalance + finalWarosAmount, // balance_after
          activity_id, // Usar activity_id directamente
          description || `Waros ganados por actividad: ${activity.activity_name || 'Sin nombre'}`,
          JSON.stringify(metadata || {})
        ])
        
        // Update wallet balance
        const newBalance = currentBalance + finalWarosAmount
        await client.query(`
          UPDATE waros_wallets 
          SET current_balance = $1, updated_at = NOW()
          WHERE id = $2
        `, [newBalance, walletId])
        
        // Check for achievement unlocks
        await checkAchievementUnlocks(client, profile_id, tenantContext.tenant_id, activity.module_id)
        
        // Commit transaction
        await client.query('COMMIT')
        
        return {
          message: 'Waros asignados exitosamente',
          transaction: transactionResult.rows[0],
          new_balance: newBalance,
          waros_earned: finalWarosAmount,
          module_multiplier: moduleMultiplier
        }
        
      } catch (error) {
        // Rollback transaction
        await client.query('ROLLBACK')
        throw error
      }
    }, event)
  })
})

// Helper function to check achievement unlocks
async function checkAchievementUnlocks(client, profileId, tenantId, moduleId) {
  // Get all achievements for this tenant 
  const achievementsResult = await client.query(`
    SELECT * FROM achievements 
    WHERE tenant_id = $1 AND is_active = true
  `, [tenantId])
  
  for (const achievement of achievementsResult.rows) {
    // Check if user already has this achievement
    const existingResult = await client.query(`
      SELECT id FROM user_achievements 
      WHERE profile_id = $1 AND achievement_id = $2
    `, [profileId, achievement.id])
    
    if (existingResult.rows.length > 0) {
      continue // User already has this achievement
    }
    
    // Check if achievement conditions are met
    const conditionMet = await checkAchievementCondition(
      client, 
      profileId, 
      tenantId, 
      achievement
    )
    
    if (conditionMet) {
      // Award achievement
      await client.query(`
        INSERT INTO user_achievements (
          profile_id, achievement_id, tenant_id, earned_date, created_at
        ) VALUES ($1, $2, $3, NOW(), NOW())
      `, [profileId, achievement.id, tenantId])
      
      // Award bonus Waros for achievement
      if (achievement.waro_reward > 0) {
        // Get wallet
        const walletResult = await client.query(`
          SELECT id, current_balance FROM waros_wallets 
          WHERE profile_id = $1 AND tenant_id = $2
        `, [profileId, tenantId])
        
        if (walletResult.rows.length > 0) {
          const wallet = walletResult.rows[0]
          
          // Create bonus transaction
          await client.query(`
            INSERT INTO waros_transactions (
              profile_id, tenant_id, transaction_type, waros_amount,
              balance_after, description, created_at
            ) VALUES ($1, $2, 'bonus', $3, $4, $5, NOW())
          `, [
            profileId,
            tenantId,
            achievement.waro_reward,
            wallet.current_balance + achievement.waro_reward,
            `Bonus por logro: ${achievement.achievement_name}`
          ])
          
          // Update wallet balance
          await client.query(`
            UPDATE waros_wallets 
            SET current_balance = current_balance + $1, updated_at = NOW()
            WHERE id = $2
          `, [achievement.waro_reward, wallet.id])
        }
      }
    }
  }
}

// Helper function to check if achievement condition is met
async function checkAchievementCondition(client, profileId, tenantId, achievement) {
  switch (achievement.condition_type) {
    case 'count':
      // Count transactions in time period
      let timeCondition = ''
      if (achievement.time_period) {
        timeCondition = `AND created_at >= NOW() - INTERVAL '${achievement.time_period}'`
      }
      
      const countResult = await client.query(`
        SELECT COUNT(*) as count
        FROM waros_transactions 
        WHERE profile_id = $1 AND tenant_id = $2 AND transaction_type = 'earned'
        ${timeCondition}
      `, [profileId, tenantId])
      
      const count = parseInt(countResult.rows[0].count)
      return evaluateCondition(count, achievement.condition_operator, achievement.condition_value)
      
    case 'streak':
      // Check consecutive days (simplified)
      const streakResult = await client.query(`
        SELECT COUNT(DISTINCT DATE(created_at)) as streak_days
        FROM waros_transactions 
        WHERE profile_id = $1 AND tenant_id = $2 AND transaction_type = 'earned'
        AND created_at >= NOW() - INTERVAL '30 days'
      `, [profileId, tenantId])
      
      const streakDays = parseInt(streakResult.rows[0].streak_days)
      return evaluateCondition(streakDays, achievement.condition_operator, achievement.condition_value)
      
    case 'multiple_activities':
      // Check multiple activity requirements
      const criteria = JSON.parse(achievement.unlock_criteria)
      const metadata = criteria.condition_metadata
      
      if (!metadata || !metadata.required_activities) {
        return false
      }
      
      // Check each required activity
      for (const req of metadata.required_activities) {
        const activityCountResult = await client.query(`
          SELECT COUNT(*) as count
          FROM waros_transactions 
          WHERE profile_id = $1 AND tenant_id = $2 
          AND transaction_type = 'earned'
          AND activity_id = $3
        `, [profileId, tenantId, req.activity_id])
        
        const activityCount = parseInt(activityCountResult.rows[0].count)
        
        // If any requirement is not met, return false
        if (activityCount < req.min_count) {
          return false
        }
      }
      
      // All requirements met
      return true
      
    default:
      return false
  }
}

// Helper function to evaluate conditions
function evaluateCondition(actualValue, operator, targetValue) {
  switch (operator) {
    case '>=':
      return actualValue >= targetValue
    case '>':
      return actualValue > targetValue
    case '=':
    case '==':
      return actualValue === targetValue
    case '<':
      return actualValue < targetValue
    case '<=':
      return actualValue <= targetValue
    default:
      return false
  }
}