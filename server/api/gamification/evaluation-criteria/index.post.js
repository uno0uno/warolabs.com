import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    const body = await readBody(event)
    const { 
      evaluation_type,
      evaluation_name,
      activity_id,
      source_config,
      validation_config,
      description,
      is_active
    } = body
    
    // Validate required fields
    if (!evaluation_type || !evaluation_name || !activity_id || !source_config || !validation_config) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Los campos evaluation_type, evaluation_name, activity_id, source_config y validation_config son requeridos'
      })
    }
    
    return await withPostgresClient(async (client) => {
      
      // Verify the activity belongs to this tenant
      const activityCheck = await client.query(`
        SELECT id FROM gamification_activities 
        WHERE id = $1 AND tenant_id = $2
      `, [activity_id, tenantContext.tenant_id])
      
      if (activityCheck.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Actividad no encontrada o no pertenece a este tenant'
        })
      }
      
      // Insert new evaluation criteria
      const result = await client.query(`
        INSERT INTO evaluation_criteria (
          tenant_id, evaluation_type, evaluation_name, activity_id,
          source_config, validation_config, description, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `, [
        tenantContext.tenant_id,
        evaluation_type,
        evaluation_name,
        activity_id,
        JSON.stringify(source_config),
        JSON.stringify(validation_config),
        description || '',
        is_active !== false
      ])
      
      return {
        message: 'Criterio de evaluación creado exitosamente',
        evaluation_criteria: result.rows[0]
      }
    }, event)
  })
})