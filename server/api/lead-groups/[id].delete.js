import { defineEventHandler, getRouterParam } from 'h3'
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient'

export default defineEventHandler(async (event) => {
  try {
    const groupId = getRouterParam(event, 'id')
    
    if (!groupId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID del grupo requerido'
      })
    }

    const result = await withPostgresClient(async (client) => {
      // Verificar que el grupo existe
      const groupCheck = await client.query(
        'SELECT id, name FROM lead_groups WHERE id = $1',
        [groupId]
      )

      if (groupCheck.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Grupo no encontrado'
        })
      }

      // Eliminar las relaciones primero (lead_group_members)
      await client.query(
        'DELETE FROM lead_group_members WHERE group_id = $1',
        [groupId]
      )

      // Eliminar el grupo
      const deleteResult = await client.query(
        'DELETE FROM lead_groups WHERE id = $1 RETURNING id, name',
        [groupId]
      )

      return {
        deletedGroup: deleteResult.rows[0]
      }
    })

    return {
      success: true,
      message: `Grupo "${result.deletedGroup.name}" eliminado exitosamente`,
      data: result.deletedGroup
    }

  } catch (error) {
    console.error('Error deleting lead group:', error)
    
    // Si es un error HTTP que ya creamos, lo pasamos tal como está
    if (error.statusCode) {
      throw error
    }
    
    // Para otros errores, crear uno genérico
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al eliminar el grupo'
    })
  }
})