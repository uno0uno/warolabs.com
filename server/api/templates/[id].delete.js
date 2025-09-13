import { defineEventHandler, getRouterParam } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  const templateId = getRouterParam(event, 'id');
  
  if (!templateId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Template ID is required'
    });
  }

  return await withPostgresClient(async (client) => {
    try {
      // Verificar si el template existe
      const checkQuery = 'SELECT id, name, template_type FROM templates WHERE id = $1';
      const checkResult = await client.query(checkQuery, [templateId]);
      
      if (checkResult.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Template not found'
        });
      }

      const template = checkResult.rows[0];

      // Eliminar primero las versiones del template
      await client.query('DELETE FROM template_versions WHERE template_id = $1', [templateId]);
      
      // Luego eliminar el template
      await client.query('DELETE FROM templates WHERE id = $1', [templateId]);

      return {
        success: true,
        message: `Template "${template.name}" eliminado exitosamente`,
        data: { id: templateId, name: template.name }
      };

    } catch (error) {
      console.error('Error deleting template:', error);
      
      if (error.statusCode) {
        throw error; // Re-throw HTTP errors
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Error deleting template'
      });
    }
  }, event);
});