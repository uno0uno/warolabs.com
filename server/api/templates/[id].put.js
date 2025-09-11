import { defineEventHandler, readBody, createError, getRouterParam } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  return await withPostgresClient(async (client) => {
    try {
      const templateId = getRouterParam(event, 'id');
      const body = await readBody(event);
      const { 
        name, 
        description, 
        subject_template, 
        sender_email, 
        content, 
        template_type = 'massive_email',
        campaign_id 
      } = body;

      if (!templateId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Template ID is required'
        });
      }

      if (!name || !content) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Nombre y contenido son requeridos'
        });
      }

      // Update template basic info
      const updateTemplateQuery = `
        UPDATE templates 
        SET template_name = $1, description = $2, template_type = $3, subject_template = $4, sender_email = $5
        WHERE id = $6
        RETURNING id
      `;

      await client.query(updateTemplateQuery, [
        name,
        description,
        template_type,
        subject_template,
        sender_email,
        templateId
      ]);

      // Get the next version number
      const versionCountQuery = `
        SELECT COALESCE(MAX(version_number), 0) + 1 as next_version
        FROM template_versions 
        WHERE template_id = $1
      `;
      
      const versionCountResult = await client.query(versionCountQuery, [templateId]);
      const nextVersion = versionCountResult.rows[0].next_version;

      // Create new template version
      const versionQuery = `
        INSERT INTO template_versions (template_id, version_number, content)
        VALUES ($1, $2, $3)
        RETURNING id
      `;

      const versionResult = await client.query(versionQuery, [templateId, nextVersion, content]);
      const versionId = versionResult.rows[0].id;

      // Update template to set new active_version_id
      const updateActiveVersionQuery = `
        UPDATE templates 
        SET active_version_id = $1 
        WHERE id = $2
      `;
      
      await client.query(updateActiveVersionQuery, [versionId, templateId]);

      // Associate with campaign if provided
      if (campaign_id) {
        const associationQuery = `
          INSERT INTO campaign_template_versions (campaign_id, template_version_id)
          VALUES ($1, $2)
        `;
        
        await client.query(associationQuery, [campaign_id, versionId]);
      }

      return {
        success: true,
        message: 'Template actualizado exitosamente',
        data: { 
          templateId, 
          versionId, 
          versionNumber: nextVersion 
        }
      };

    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }, event);
});