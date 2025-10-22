import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    const body = await readBody(event)
    const { 
      module_id,
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
      condition_metadata,
      time_period,
      is_active
    } = body
    
    // Validate required fields
    if (!achievement_name || !category || !waro_reward) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Los campos achievement_name, category y waro_reward son requeridos'
      })
    }
    
    return await withPostgresClient(async (client) => {
      
      // If module_id is provided, verify it belongs to this tenant
      if (module_id) {
        const moduleCheck = await client.query(`
          SELECT id FROM gamification_modules 
          WHERE id = $1 AND tenant_id = $2
        `, [module_id, tenantContext.tenant_id])
        
        if (moduleCheck.rows.length === 0) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Módulo no encontrado o no pertenece a este tenant'
          })
        }
      }
      
      // Insert new achievement
      const result = await client.query(`
        INSERT INTO achievements (
          tenant_id, achievement_name, achievement_description,
          icon_emoji, unlock_criteria, waros_reward, rarity, is_active, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING *
      `, [
        tenantContext.tenant_id,
        achievement_name,
        achievement_description || '',
        icon_name || '🏆',
        JSON.stringify({
          condition_type: condition_type || 'count',
          condition_value: condition_value || 1,
          condition_operator: condition_operator || '>=',
          condition_metadata: condition_metadata || null,
          time_period: time_period || null,
          module_id: module_id || null
        }),
        waro_reward || 0,
        rarity || 'common',
        is_active !== false
      ])
      
      return {
        message: 'Logro creado exitosamente',
        achievement: result.rows[0]
      }
    }, event)
  })
})