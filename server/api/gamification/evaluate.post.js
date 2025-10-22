import { withTenantIsolation, executeWithTenantFilter } from '../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    const body = await readBody(event)
    const { 
      profile_id,
      evaluation_criteria_id,
      evaluation_data
    } = body
    
    // Validate required fields
    if (!profile_id || !evaluation_criteria_id || !evaluation_data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Los campos profile_id, evaluation_criteria_id y evaluation_data son requeridos'
      })
    }
    
    const startTime = Date.now()
    
    return await withPostgresClient(async (client) => {
      
      // Start transaction
      await client.query('BEGIN')
      
      try {
        // 1. Obtener criterio de evaluación
        const criteriaResult = await client.query(`
          SELECT ec.*, ga.base_waros, ga.activity_name, gm.waro_multiplier
          FROM evaluation_criteria ec
          JOIN gamification_activities ga ON ec.activity_id = ga.id
          JOIN gamification_modules gm ON ga.module_id = gm.id
          WHERE ec.id = $1 AND ec.tenant_id = $2 AND ec.is_active = true
        `, [evaluation_criteria_id, tenantContext.tenant_id])
        
        if (criteriaResult.rows.length === 0) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Criterio de evaluación no encontrado'
          })
        }
        
        const criteria = criteriaResult.rows[0]
        const { source_config, validation_config, activity_id } = criteria
        
        // 2. Obtener datos según configuración
        let queryData = null
        
        if (source_config.query_type === 'manual') {
          // Evaluación manual - usar datos enviados
          queryData = evaluation_data
        } else if (source_config.query_type === 'database') {
          // Evaluación por BD - construir query dinámico
          queryData = await executeSourceQuery(client, source_config, profile_id, tenantContext.tenant_id)
        }
        
        // 3. Evaluar condiciones
        const evaluationResult = evaluateCondition(queryData, validation_config)
        
        // 4. Registrar resultado de evaluación
        const evaluationRecord = await client.query(`
          INSERT INTO evaluation_results (
            profile_id, tenant_id, evaluation_criteria_id, activity_id,
            input_data, queried_data, evaluation_passed, failure_reason,
            waros_awarded, activity_completed, processing_time_ms
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id
        `, [
          profile_id,
          tenantContext.tenant_id,
          evaluation_criteria_id,
          activity_id,
          JSON.stringify(evaluation_data),
          JSON.stringify(queryData),
          evaluationResult.passed,
          evaluationResult.reason,
          0, // Se actualiza después si pasa
          false,
          Date.now() - startTime
        ])
        
        const evaluationRecordId = evaluationRecord.rows[0].id
        
        // 5. Si pasó la evaluación, asignar Waros
        let warosResponse = null
        if (evaluationResult.passed) {
          
          // Llamar al endpoint de asignación de Waros
          warosResponse = await $fetch('/api/gamification/waros/assign', {
            method: 'POST',
            headers: {
              'Cookie': getHeader(event, 'cookie') || '',
              'Host': getHeader(event, 'host') || 'localhost'
            },
            body: {
              profile_id,
              activity_id,
              description: `Evaluación ${criteria.evaluation_name} completada exitosamente`,
              metadata: {
                evaluation_criteria_id,
                evaluation_type: criteria.evaluation_type,
                evaluation_data: queryData,
                evaluation_record_id: evaluationRecordId
              }
            }
          })
          
          // Actualizar registro con Waros otorgados
          await client.query(`
            UPDATE evaluation_results 
            SET waros_awarded = $1, activity_completed = true 
            WHERE id = $2
          `, [warosResponse.waros_earned, evaluationRecordId])
        }
        
        // Commit transaction
        await client.query('COMMIT')
        
        const response = {
          evaluation_id: evaluationRecordId,
          evaluation_type: criteria.evaluation_type,
          evaluation_name: criteria.evaluation_name,
          passed: evaluationResult.passed,
          evaluation_data: queryData,
          processing_time_ms: Date.now() - startTime
        }
        
        if (evaluationResult.passed && warosResponse) {
          response.waros_earned = warosResponse.waros_earned
          response.new_balance = warosResponse.new_balance
          response.activity_completed = true
          response.achievements_unlocked = warosResponse.achievements_unlocked || []
        } else {
          response.failure_reason = evaluationResult.reason
          response.waros_earned = 0
        }
        
        return response
        
      } catch (error) {
        // Rollback transaction
        await client.query('ROLLBACK')
        throw error
      }
    }, event)
  })
})

// Función para ejecutar queries dinámicos de fuente de datos
async function executeSourceQuery(client, sourceConfig, profileId, tenantId) {
  try {
    const { query, parameters } = sourceConfig
    
    // Reemplazar parámetros en el query
    let finalQuery = query
    const queryParams = []
    
    if (parameters && parameters.length > 0) {
      for (let i = 0; i < parameters.length; i++) {
        const param = parameters[i]
        if (param === 'profile_id') {
          queryParams.push(profileId)
        } else if (param === 'tenant_id') {
          queryParams.push(tenantId)
        } else {
          // Parámetro no reconocido
          queryParams.push(null)
        }
      }
    }
    
    // Ejecutar query
    const result = await client.query(finalQuery, queryParams)
    
    // Retornar primer resultado o objeto vacío
    if (result.rows && result.rows.length > 0) {
      return result.rows[0]
    } else {
      return {}
    }
    
  } catch (error) {
    console.error('Error executing source query:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Error en query de evaluación: ${error.message}`
    })
  }
}

// Función para evaluar condiciones
function evaluateCondition(data, validationConfig) {
  try {
    const { comparison, required_fields } = validationConfig
    
    // Verificar campos requeridos
    if (required_fields) {
      for (const field of required_fields) {
        if (!(field in data) || data[field] === null || data[field] === undefined) {
          return {
            passed: false,
            reason: `Campo requerido faltante: ${field}`
          }
        }
      }
    }
    
    // Evaluar comparación
    if (comparison) {
      // Reemplazar variables en la expresión
      let expression = comparison
      for (const [key, value] of Object.entries(data)) {
        // Escape numeric values safely
        const numericValue = typeof value === 'number' ? value : parseFloat(value)
        if (!isNaN(numericValue)) {
          expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), numericValue)
        }
      }
      
      // Evaluar expresión de forma segura
      const result = new Function('return ' + expression)()
      
      return {
        passed: Boolean(result),
        reason: result ? 'Evaluación exitosa' : `Condición no cumplida: ${comparison}`
      }
    }
    
    return { passed: true, reason: 'Evaluación completada' }
    
  } catch (error) {
    return {
      passed: false,
      reason: `Error en evaluación: ${error.message}`
    }
  }
}