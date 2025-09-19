import { defineEventHandler, getRouterParam } from 'h3'
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient'
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation'

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;
  try {
    console.log(`🔐 Eliminando lead group para tenant: ${tenantContext.tenant_name}`);
    
    const groupId = getRouterParam(event, 'id')
    
    if (!groupId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID del grupo requerido'
      })
    }

    const result = await withPostgresClient(async (client) => {
      // Verificar que el grupo existe y pertenece al tenant
      const baseCheckQuery = `
        SELECT lg.id, lg.name 
        FROM lead_groups lg
        JOIN profile p ON lg.created_by_profile_id = p.id
        JOIN tenant_members tm ON p.id = tm.user_id
        WHERE lg.id = $1
      `;
      
      const { query: checkQuery, params: checkParams } = addTenantFilterSimple(
        baseCheckQuery, 
        tenantContext, 
        [groupId]
      );
      
      const groupCheck = await client.query(checkQuery, checkParams);

      if (groupCheck.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Grupo no encontrado o sin acceso'
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