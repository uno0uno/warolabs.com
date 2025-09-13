import { defineEventHandler, getRouterParam } from 'h3';
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  const pairId = getRouterParam(event, 'id');
  
  if (!pairId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Pair ID is required'
    });
  }

  return await withPostgresClient(async (client) => {
    try {
      // Comenzar transacción
      await client.query('BEGIN');

      // Obtener información del par y sus templates antes de eliminar
      const pairQuery = `
        SELECT 
          t.id,
          t.name,
          t.template_type,
          t.pair_id
        FROM templates t
        WHERE t.pair_id = $1
      `;
      
      const pairResult = await client.query(pairQuery, [pairId]);
      
      if (pairResult.rows.length === 0) {
        await client.query('ROLLBACK');
        throw createError({
          statusCode: 404,
          statusMessage: 'Template pair not found'
        });
      }

      const templates = pairResult.rows;
      const emailTemplate = templates.find(t => t.template_type === 'email');
      const landingTemplate = templates.find(t => t.template_type === 'landing');

      // Eliminar las relaciones en campaign_template_versions si existen
      await client.query(
        'DELETE FROM campaign_template_versions WHERE template_version_id IN (SELECT id FROM template_versions WHERE template_id = ANY($1))',
        [templates.map(t => t.id)]
      );

      // Eliminar todas las versiones de los templates del par
      await client.query(
        'DELETE FROM template_versions WHERE template_id = ANY($1)',
        [templates.map(t => t.id)]
      );

      // Eliminar los templates del par
      await client.query('DELETE FROM templates WHERE pair_id = $1', [pairId]);

      // Confirmar transacción
      await client.query('COMMIT');

      return {
        success: true,
        message: `Par de templates "${emailTemplate?.name || 'Email'}" y "${landingTemplate?.name || 'Landing'}" eliminado exitosamente`,
        data: { 
          pair_id: pairId,
          deleted_templates: templates.map(t => ({ id: t.id, name: t.name, type: t.template_type }))
        }
      };

    } catch (error) {
      // Rollback en caso de error
      await client.query('ROLLBACK');
      console.error('Error deleting template pair:', error);
      
      if (error.statusCode) {
        throw error; // Re-throw HTTP errors
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Error deleting template pair'
      });
    }
  }, event);
});