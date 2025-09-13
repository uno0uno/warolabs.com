import { defineEventHandler, getRouterParam } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

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
        WHERE c.id = $1
        GROUP BY c.id, c.name, c.slug, c.status, c.created_at
      `;
      
      const campaignResult = await client.query(campaignQuery, [campaignId]);
      
      if (campaignResult.rows.length === 0) {
        await client.query('ROLLBACK');
        throw createError({
          statusCode: 404,
          statusMessage: 'Campaign not found'
        });
      }

      const campaign = campaignResult.rows[0];
      const hasLeads = parseInt(campaign.total_leads) > 0;
      const hasClicks = parseInt(campaign.total_clicks) > 0;
      const hasOpens = parseInt(campaign.total_opens) > 0;

      // Verificar si la campaña tiene datos críticos
      if (hasLeads || hasClicks || hasOpens) {
        await client.query('ROLLBACK');
        throw createError({
          statusCode: 400,
          statusMessage: 'Cannot delete campaign with existing data',
          data: {
            reason: 'CAMPAIGN_HAS_DATA',
            details: {
              leads: parseInt(campaign.total_leads),
              clicks: parseInt(campaign.total_clicks),
              opens: parseInt(campaign.total_opens),
              suggestion: 'Consider pausing or archiving this campaign instead of deleting it'
            }
          }
        });
      }

      // 1. Eliminar clicks de emails relacionados con esta campaña
      await client.query(
        'DELETE FROM email_clicks WHERE campaign_id = $1',
        [campaignId]
      );

      // 2. Eliminar opens de emails relacionados con esta campaña
      await client.query(
        'DELETE FROM email_opens WHERE campaign_id = $1', 
        [campaignId]
      );

      // 3. Eliminar relaciones campaign_leads
      await client.query(
        'DELETE FROM campaign_leads WHERE campaign_id = $1',
        [campaignId]
      );

      // 4. Eliminar relaciones campaign_template_versions
      await client.query(
        'DELETE FROM campaign_template_versions WHERE campaign_id = $1',
        [campaignId]
      );

      // 5. Finalmente eliminar la campaña
      await client.query('DELETE FROM campaign WHERE id = $1', [campaignId]);

      // Confirmar transacción
      await client.query('COMMIT');

      return {
        success: true,
        message: `Campaña "${campaign.name}" eliminada exitosamente`,
        data: { 
          id: campaignId,
          name: campaign.name,
          leads_count: parseInt(campaign.total_leads) || 0
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
        statusMessage: 'Error deleting campaign'
      });
    }
  }, event);
});