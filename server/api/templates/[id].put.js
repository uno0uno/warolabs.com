import { defineEventHandler, readBody, createError, getRouterParam } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  const templateId = getRouterParam(event, 'id');
  const body = await readBody(event);
  
  return await withPostgresClient(async (client) => {
    try {
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

      // Handle campaign associations with traceability (soft delete approach)
      // Get all active associations for this template
      const getActiveAssociationsQuery = `
        SELECT campaign_id, template_version_id 
        FROM campaign_template_versions ctv
        JOIN template_versions tv ON ctv.template_version_id = tv.id
        WHERE tv.template_id = $1 AND ctv.is_active = true
      `;
      
      const activeAssociations = await client.query(getActiveAssociationsQuery, [templateId]);
      
      // Deactivate old associations and create history records
      for (const association of activeAssociations.rows) {
        // Soft delete the old association
        const deactivateQuery = `
          UPDATE campaign_template_versions 
          SET is_active = false, deactivated_at = NOW()
          WHERE campaign_id = $1 AND template_version_id = $2 AND is_active = true
        `;
        await client.query(deactivateQuery, [association.campaign_id, association.template_version_id]);
        
        // Create new active association with the new version
        const createNewAssociationQuery = `
          INSERT INTO campaign_template_versions (campaign_id, template_version_id, is_active)
          VALUES ($1, $2, true)
          ON CONFLICT (campaign_id, template_version_id) 
          DO UPDATE SET is_active = true, deactivated_at = NULL
        `;
        await client.query(createNewAssociationQuery, [association.campaign_id, versionId]);
        
        // Record in history table
        const historyQuery = `
          INSERT INTO template_version_history 
          (template_id, old_version_id, new_version_id, campaign_id, action_type, change_reason)
          VALUES ($1, $2, $3, $4, 'UPDATE', 'Template content updated')
        `;
        await client.query(historyQuery, [
          templateId, 
          association.template_version_id, 
          versionId, 
          association.campaign_id
        ]);
      }

      // Additionally, associate with campaign if specifically provided
      if (campaign_id) {
        // Check if there are existing associations for this specific campaign and template
        const existingAssociationQuery = `
          SELECT campaign_id, template_version_id FROM campaign_template_versions 
          WHERE campaign_id = $1 
          AND template_version_id IN (
            SELECT id FROM template_versions WHERE template_id = $2
          )
          AND is_active = true
        `;
        
        const existingResult = await client.query(existingAssociationQuery, [campaign_id, templateId]);
        
        if (existingResult.rows.length === 0) {
          // Create new association if it doesn't exist
          const associationQuery = `
            INSERT INTO campaign_template_versions (campaign_id, template_version_id, is_active)
            VALUES ($1, $2, true)
          `;
          await client.query(associationQuery, [campaign_id, versionId]);
          
          // Record in history table
          const historyQuery = `
            INSERT INTO template_version_history 
            (template_id, old_version_id, new_version_id, campaign_id, action_type, change_reason)
            VALUES ($1, NULL, $2, $3, 'CREATE', 'New campaign association created')
          `;
          await client.query(historyQuery, [templateId, versionId, campaign_id]);
        }
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
      console.error('Template ID:', templateId);
      console.error('Body data:', body);
      throw error;
    }
  }, event);
});