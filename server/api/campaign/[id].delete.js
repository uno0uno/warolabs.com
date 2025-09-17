import { defineEventHandler, getRouterParam, createError } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';

export default defineEventHandler(async (event) => {
  const campaignId = getRouterParam(event, 'id');
  
  if (!campaignId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Campaign ID is required'
    });
  }

  return await withPostgresClient(async (client) => {
    try {
      // Get user info for audit trail
      let userId = null;
      try {
        const authResult = await verifyAuthToken(event);
        userId = authResult?.userId || null;
      } catch (e) {
        // Continue without user ID if auth fails
      }

      // Comenzar transacción
      await client.query('BEGIN');

      // Obtener información de la campaña y verificar datos críticos
      const campaignQuery = `
        SELECT 
          c.id,
          c.name,
          c.slug,
          c.status,
          c.created_at,
          COUNT(DISTINCT l.id) as total_leads,
          COUNT(DISTINCT ec.id) as total_clicks,
          COUNT(DISTINCT eo.id) as total_opens
        FROM campaign c
        LEFT JOIN campaign_leads cl ON c.id = cl.campaign_id
        LEFT JOIN leads l ON cl.lead_id = l.id
        LEFT JOIN email_clicks ec ON c.id = ec.campaign_id
        LEFT JOIN email_opens eo ON c.id = eo.campaign_id
        WHERE c.id = $1 AND (c.is_deleted = false OR c.is_deleted IS NULL)
        GROUP BY c.id, c.name, c.slug, c.status, c.created_at
      `;
      
      const campaignResult = await client.query(campaignQuery, [campaignId]);
      
      if (campaignResult.rows.length === 0) {
        await client.query('ROLLBACK');
        throw createError({
          statusCode: 404,
          statusMessage: 'Campaign not found or already deleted'
        });
      }

      const campaign = campaignResult.rows[0];
      const hasLeads = parseInt(campaign.total_leads) > 0;
      const hasClicks = parseInt(campaign.total_clicks) > 0;
      const hasOpens = parseInt(campaign.total_opens) > 0;

      // Verificar si la campaña tiene datos críticos - Si tiene datos, hacer soft delete preservando todo
      const preserveData = hasLeads || hasClicks || hasOpens;

      // Crear registro de historial de eliminación de campaña
      const historyQuery = `
        INSERT INTO campaign_history 
        (campaign_id, action_type, change_reason, changed_by, metadata)
        VALUES ($1, 'DELETE', $2, $3, $4)
      `;
      
      const metadata = {
        campaign_name: campaign.name,
        total_leads: parseInt(campaign.total_leads),
        total_clicks: parseInt(campaign.total_clicks),
        total_opens: parseInt(campaign.total_opens),
        data_preserved: preserveData,
        deleted_at: new Date().toISOString()
      };

      // Insertar registro en campaign_history
      await client.query(historyQuery, [
        campaignId,
        preserveData ? 'Soft delete - campaign has associated data' : 'Soft delete - no associated data',
        userId,
        JSON.stringify(metadata)
      ]);

      // Soft delete de las asociaciones con template versions
      const deactivateTemplatesQuery = `
        UPDATE campaign_template_versions 
        SET is_active = false, deactivated_at = NOW()
        WHERE campaign_id = $1 AND is_active = true
      `;
      await client.query(deactivateTemplatesQuery, [campaignId]);

      // Registrar en template_version_history para cada template asociado
      const templateAssociationsQuery = `
        SELECT ctv.template_version_id, tv.template_id
        FROM campaign_template_versions ctv
        JOIN template_versions tv ON ctv.template_version_id = tv.id
        WHERE ctv.campaign_id = $1
      `;
      
      const templateAssociations = await client.query(templateAssociationsQuery, [campaignId]);
      
      for (const association of templateAssociations.rows) {
        const templateHistoryQuery = `
          INSERT INTO template_version_history 
          (template_id, old_version_id, new_version_id, campaign_id, action_type, change_reason, changed_by)
          VALUES ($1, $2, NULL, $3, 'CAMPAIGN_DELETE', 'Campaign deleted', $4)
        `;
        await client.query(templateHistoryQuery, [
          association.template_id,
          association.template_version_id,
          campaignId,
          userId
        ]);
      }

      // Soft delete de la campaña
      const softDeleteQuery = `
        UPDATE campaign 
        SET is_deleted = true, deleted_at = NOW(), deleted_by = $1
        WHERE id = $2
      `;
      await client.query(softDeleteQuery, [userId, campaignId]);

      // Nota: campaign_leads no tiene campo is_active, así que no necesitamos actualizarlo

      // Confirmar transacción
      await client.query('COMMIT');

      return {
        success: true,
        message: `Campaña "${campaign.name}" eliminada exitosamente con trazabilidad completa`,
        data: { 
          campaign_id: campaignId,
          name: campaign.name,
          deleted_at: new Date().toISOString(),
          recoverable: true,
          data_preserved: preserveData,
          statistics: {
            leads_count: parseInt(campaign.total_leads) || 0,
            clicks_count: parseInt(campaign.total_clicks) || 0,
            opens_count: parseInt(campaign.total_opens) || 0
          }
        }
      };

    } catch (error) {
      // Rollback en caso de error
      await client.query('ROLLBACK');
      console.error('Error deleting campaign:', error);
      
      if (error.statusCode) {
        throw error; // Re-throw HTTP errors
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Error deleting campaign with traceability'
      });
    }
  }, event);
});