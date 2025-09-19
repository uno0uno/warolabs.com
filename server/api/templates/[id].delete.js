import { defineEventHandler, getRouterParam, createError } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const templateId = getRouterParam(event, 'id');
  const tenantContext = event.context.tenant;
  
  if (!templateId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Template ID is required'
    });
  }

  return await withPostgresClient(async (client) => {
    try {
      console.log(`🔐 Eliminando template ${templateId} para tenant: ${tenantContext.tenant_name}`);
      
      // User ID desde el contexto de tenant
      const userId = tenantContext.user_id;

      // Begin transaction
      await client.query('BEGIN');

      // Verificar acceso al template con ownership
      let verifyQuery;
      let verifyParams;

      if (tenantContext.is_superuser) {
        // Superuser can delete any template
        console.log('🔓 Superuser access: can delete any template');
        verifyQuery = `
          SELECT t.id 
          FROM templates t
          WHERE t.id = $1 AND t.is_deleted = false
        `;
        verifyParams = [templateId];
      } else {
        // Other users can only delete their own templates
        console.log(`🔒 User access: verifying template ownership for ${tenantContext.user_id}`);
        verifyQuery = `
          SELECT t.id 
          FROM templates t
          WHERE t.id = $1 AND t.is_deleted = false AND t.created_by_profile_id = $2
        `;
        verifyParams = [templateId, tenantContext.user_id];
      }
      
      const verifyResult = await client.query(verifyQuery, verifyParams);
      
      if (verifyResult.rows.length === 0) {
        await client.query('ROLLBACK');
        console.log(`❌ Template ${templateId} no encontrado o sin acceso para tenant: ${tenantContext.tenant_name}`);
        throw createError({
          statusCode: 404,
          statusMessage: 'Template not found or access denied'
        });
      }

      // Get template information before soft delete
      let templateQuery;
      let templateParams;

      if (tenantContext.is_superuser) {
        // Superuser can access any template
        templateQuery = `
          SELECT 
            t.id,
            t.template_name as name,
            t.template_type,
            t.pair_id,
            t.active_version_id,
            t.is_deleted
          FROM templates t
          WHERE t.id = $1 AND t.is_deleted = false
        `;
        templateParams = [templateId];
      } else {
        // Other users can only access their own templates
        templateQuery = `
          SELECT 
            t.id,
            t.template_name as name,
            t.template_type,
            t.pair_id,
            t.active_version_id,
            t.is_deleted
          FROM templates t
          WHERE t.id = $1 AND t.is_deleted = false AND t.created_by_profile_id = $2
        `;
        templateParams = [templateId, tenantContext.user_id];
      }
      
      const templateResult = await client.query(templateQuery, templateParams);
      
      if (templateResult.rows.length === 0) {
        await client.query('ROLLBACK');
        throw createError({
          statusCode: 404,
          statusMessage: 'Template not found or already deleted'
        });
      }

      const template = templateResult.rows[0];

      // Check if this template is part of a pair - if so, we should use the pair deletion endpoint
      if (template.pair_id) {
        await client.query('ROLLBACK');
        throw createError({
          statusCode: 400,
          statusMessage: 'This template is part of a pair. Please use the pair deletion endpoint to maintain data integrity.'
        });
      }

      // Soft delete template (mark as deleted instead of physical delete)
      const softDeleteQuery = `
        UPDATE templates 
        SET is_deleted = true, deleted_at = NOW(), deleted_by = $1
        WHERE id = $2
      `;
      await client.query(softDeleteQuery, [userId, templateId]);

      // Get all active associations for this template
      const activeAssociationsQuery = `
        SELECT campaign_id, template_version_id
        FROM campaign_template_versions ctv
        JOIN template_versions tv ON ctv.template_version_id = tv.id
        WHERE tv.template_id = $1 AND ctv.is_active = true
      `;
      
      const activeAssociations = await client.query(activeAssociationsQuery, [templateId]);

      // Deactivate each association and record history
      for (const association of activeAssociations.rows) {
        // Soft delete the association
        const deactivateQuery = `
          UPDATE campaign_template_versions 
          SET is_active = false, deactivated_at = NOW()
          WHERE campaign_id = $1 AND template_version_id = $2 AND is_active = true
        `;
        await client.query(deactivateQuery, [association.campaign_id, association.template_version_id]);

        // Record deletion in history
        const historyQuery = `
          INSERT INTO template_version_history 
          (template_id, old_version_id, new_version_id, campaign_id, action_type, change_reason, changed_by)
          VALUES ($1, $2, NULL, $3, 'DELETE', $4, $5)
        `;
        await client.query(historyQuery, [
          templateId,
          template.active_version_id,
          association.campaign_id,
          `Template ${template.template_type} deleted`,
          userId
        ]);
      }

      // Record template deletion in history
      const templateHistoryQuery = `
        INSERT INTO template_version_history 
        (template_id, old_version_id, new_version_id, campaign_id, action_type, change_reason, changed_by)
        VALUES ($1, $2, NULL, NULL, 'DELETE', 'Template deleted', $3)
      `;
      await client.query(templateHistoryQuery, [templateId, template.active_version_id, userId]);

      // Commit transaction
      await client.query('COMMIT');

      console.log(`✅ Template ${templateId} ("${template.name}") eliminado exitosamente para tenant: ${tenantContext.tenant_name}`);
      return {
        success: true,
        message: `Template "${template.name}" eliminado exitosamente con trazabilidad completa`,
        data: { 
          template_id: templateId,
          name: template.name,
          type: template.template_type,
          deleted_at: new Date().toISOString(),
          recoverable: true,
          deactivated_associations: activeAssociations.rows.length
        },
        tenant_info: {
          tenant_id: tenantContext.tenant_id,
          tenant_name: tenantContext.tenant_name,
          user_role: tenantContext.role,
          is_superuser: tenantContext.is_superuser
        }
      };

    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.error(`Error deleting template ${templateId} para tenant ${tenantContext.tenant_name}:`, error);
      
      if (error.statusCode) {
        throw error; // Re-throw HTTP errors
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Error deleting template with traceability'
      });
    }
  }, event);
});