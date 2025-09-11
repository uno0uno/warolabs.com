import { defineEventHandler, readBody, createError } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  return await withPostgresClient(async (client) => {
    try {
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

      if (!name || !content) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Nombre y contenido son requeridos'
        });
      }

      // Create template
      const templateQuery = `
        INSERT INTO templates (template_name, description, template_type, subject_template, sender_email)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;

      const templateResult = await client.query(templateQuery, [
        name,
        description,
        template_type,
        subject_template,
        sender_email
      ]);

      const templateId = templateResult.rows[0].id;

      // Create template version
      const versionQuery = `
        INSERT INTO template_versions (template_id, version_number, content)
        VALUES ($1, 1, $2)
        RETURNING id
      `;

      const versionResult = await client.query(versionQuery, [templateId, content]);
      const versionId = versionResult.rows[0].id;

      // Update template to set active_version_id
      const updateTemplateQuery = `
        UPDATE templates 
        SET active_version_id = $1 
        WHERE id = $2
      `;
      
      await client.query(updateTemplateQuery, [versionId, templateId]);

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
        message: 'Template creado exitosamente',
        data: { templateId, versionId }
      };

    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }, event);
});