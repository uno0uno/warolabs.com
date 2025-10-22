import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    const achievementId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { 
      achievement_name,
      achievement_description,
      category,
      rarity,
      icon_name,
      badge_color,
      waro_reward,
      condition_type,
      condition_value,
      condition_operator,
      time_period,
      is_active
    } = body
    
    return await withPostgresClient(async (client) => {
      
      // Verify the achievement belongs to this tenant
      const achievementCheck = await client.query(`
        SELECT id FROM achievements 
        WHERE id = $1 AND tenant_id = $2
      `, [achievementId, tenantContext.tenant_id])
      
      if (achievementCheck.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Logro no encontrado o no pertenece a este tenant'
        })
      }
      
      // Update achievement
      const result = await client.query(`
        UPDATE achievements 
        SET 
          achievement_name = COALESCE($1, achievement_name),
          achievement_description = COALESCE($2, achievement_description),
          category = COALESCE($3, category),
          rarity = COALESCE($4, rarity),
          icon_name = COALESCE($5, icon_name),
          badge_color = COALESCE($6, badge_color),
          waro_reward = COALESCE($7, waro_reward),
          condition_type = COALESCE($8, condition_type),
          condition_value = COALESCE($9, condition_value),
          condition_operator = COALESCE($10, condition_operator),
          time_period = COALESCE($11, time_period),
          is_active = COALESCE($12, is_active),
          updated_at = NOW()
        WHERE id = $13 AND tenant_id = $14
        RETURNING *
      `, [
        achievement_name,
        achievement_description,
        category,
        rarity,
        icon_name,
        badge_color,
        waro_reward,
        condition_type,
        condition_value,
        condition_operator,
        time_period,
        is_active,
        achievementId,
        tenantContext.tenant_id
      ])
      
      return {
        message: 'Logro actualizado exitosamente',
        achievement: result.rows[0]
      }
    }, event)
  })
})