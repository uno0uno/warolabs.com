import { defineEventHandler, getRouterParam } from 'h3';
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation } from '../../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;
  const pairId = getRouterParam(event, 'id');
  
  if (!pairId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Pair ID is required'
    });
  }

  return await withPostgresClient(async (client) => {
    try {
      // Get user info for audit trail (optional - remove if no auth)
      let userId = null;
      try {
        const authResult = await verifyAuthToken(event);
        userId = authResult?.userId || null;
      } catch (e) {
        // Continue without user ID if auth fails
      }

      // Begin transaction
      await client.query('BEGIN');

      // Get template pair information before soft delete with ownership verification
      let pairQuery;
      let pairParams;

      if (tenantContext.is_superuser) {
        // Superuser can delete any pair
        console.log('🔓 Superuser access: can delete any template pair');
        pairQuery = `
          SELECT 
            t.id,
            t.template_name as name,
            t.template_type,
            t.pair_id,
            t.active_version_id
          FROM templates t
          WHERE t.pair_id = $1 AND t.is_deleted = false
        `;
        pairParams = [pairId];
      } else {
        // Other users can only delete their own template pairs
        console.log(`🔒 User access: verifying template pair ownership for ${tenantContext.user_id}`);
        pairQuery = `
          SELECT 
            t.id,
            t.template_name as name,
            t.template_type,
            t.pair_id,
            t.active_version_id
          FROM templates t
          WHERE t.pair_id = $1 AND t.is_deleted = false AND t.created_by_profile_id = $2
        `;
        pairParams = [pairId, tenantContext.user_id];
      }
      
      const pairResult = await client.query(pairQuery, pairParams);
      
      if (pairResult.rows.length === 0) {
        await client.query('ROLLBACK');
        throw createError({
          statusCode: 404,
          statusMessage: 'Template pair not found or already deleted'
        });
      }

      const templates = pairResult.rows;
      const emailTemplate = templates.find(t => t.template_type === 'email');
      const landingTemplate = templates.find(t => t.template_type === 'landing');

      // Soft delete templates (mark as deleted instead of physical delete)
      const softDeleteQuery = `
        UPDATE templates 
        SET is_deleted = true, deleted_at = NOW(), deleted_by = $1
        WHERE pair_id = $2
      `;
      await client.query(softDeleteQuery, [userId, pairId]);

      // Deactivate all campaign associations for these templates with traceability
      for (const template of templates) {
        // Get all active associations for this template
        const activeAssociationsQuery = `
          SELECT campaign_id, template_version_id
          FROM campaign_template_versions ctv
          JOIN template_versions tv ON ctv.template_version_id = tv.id
          WHERE tv.template_id = $1 AND ctv.is_active = true
        `;
        
        const activeAssociations = await client.query(activeAssociationsQuery, [template.id]);

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
            template.id,
            template.active_version_id,
            association.campaign_id,
            `Template ${template.template_type} deleted as part of template pair deletion`,
            userId
          ]);
        }
      }

      // Record pair deletion in history for both templates
      if (emailTemplate) {
        const emailHistoryQuery = `
          INSERT INTO template_version_history 
          (template_id, old_version_id, new_version_id, campaign_id, action_type, change_reason, changed_by)
          VALUES ($1, $2, NULL, NULL, 'DELETE_PAIR', 'Email template deleted - template pair removed', $3)
        `;
        await client.query(emailHistoryQuery, [emailTemplate.id, emailTemplate.active_version_id, userId]);
      }

      if (landingTemplate) {
        const landingHistoryQuery = `
          INSERT INTO template_version_history 
          (template_id, old_version_id, new_version_id, campaign_id, action_type, change_reason, changed_by)
          VALUES ($1, $2, NULL, NULL, 'DELETE_PAIR', 'Landing template deleted - template pair removed', $3)
        `;
        await client.query(landingHistoryQuery, [landingTemplate.id, landingTemplate.active_version_id, userId]);
      }

      // Commit transaction
      await client.query('COMMIT');

      return {
        success: true,
        message: `Template pair "${emailTemplate?.name || 'Email'}" y "${landingTemplate?.name || 'Landing'}" eliminado exitosamente con trazabilidad completa`,
        data: { 
          pair_id: pairId,
          soft_deleted_templates: templates.map(t => ({ 
            id: t.id, 
            name: t.name, 
            type: t.template_type,
            deleted_at: new Date().toISOString(),
            recoverable: true
          }))
        }
      };

    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.error('Error soft deleting template pair:', error);
      
      if (error.statusCode) {
        throw error; // Re-throw HTTP errors
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Error deleting template pair with traceability'
      });
    }
  }, event);
});