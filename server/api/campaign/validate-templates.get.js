import { defineEventHandler, getQuery } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  return await withPostgresClient(async (client) => {
    try {
      const query = getQuery(event);
      const { campaignId } = query;

      if (!campaignId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Campaign ID is required'
        });
      }

      // Check if campaign has required templates
      const validationQuery = `
        SELECT 
          c.id as campaign_id,
          c.name as campaign_name,
          c.status,
          COUNT(CASE WHEN t.template_type = 'email' THEN 1 END) as email_templates,
          COUNT(CASE WHEN t.template_type = 'landing' THEN 1 END) as landing_templates,
          COALESCE(
            ARRAY_AGG(
              CASE WHEN t.template_type = 'email' 
              THEN json_build_object(
                'id', t.id,
                'name', t.template_name,
                'type', t.template_type,
                'version_id', tv.id,
                'version_number', tv.version_number
              ) 
              END
            ) FILTER (WHERE t.template_type = 'email'), 
            ARRAY[]::json[]
          ) as email_template_details,
          COALESCE(
            ARRAY_AGG(
              CASE WHEN t.template_type = 'landing' 
              THEN json_build_object(
                'id', t.id,
                'name', t.template_name,
                'type', t.template_type,
                'version_id', tv.id,
                'version_number', tv.version_number
              ) 
              END
            ) FILTER (WHERE t.template_type = 'landing'),
            ARRAY[]::json[]
          ) as landing_template_details
        FROM campaign c
        LEFT JOIN campaign_template_versions ctv ON c.id = ctv.campaign_id AND ctv.is_active = true
        LEFT JOIN template_versions tv ON ctv.template_version_id = tv.id
        LEFT JOIN templates t ON tv.template_id = t.id AND t.is_deleted = false
        WHERE c.id = $1 AND (c.is_deleted = false OR c.is_deleted IS NULL)
        GROUP BY c.id, c.name, c.status;
      `;

      const result = await client.query(validationQuery, [campaignId]);
      
      if (result.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Campaign not found or has been deleted'
        });
      }

      const campaign = result.rows[0];
      const hasEmailTemplate = campaign.email_templates > 0;
      const hasLandingTemplate = campaign.landing_templates > 0;
      const isValid = hasEmailTemplate && hasLandingTemplate;

      return {
        success: true,
        data: {
          campaignId: campaign.campaign_id,
          campaignName: campaign.campaign_name,
          status: campaign.status,
          validation: {
            isValid,
            hasEmailTemplate,
            hasLandingTemplate,
            requiredTemplates: ['email', 'landing'],
            missingTemplates: [
              ...(!hasEmailTemplate ? ['email'] : []),
              ...(!hasLandingTemplate ? ['landing'] : [])
            ]
          },
          templates: {
            email: campaign.email_template_details || [],
            landing: campaign.landing_template_details || []
          }
        }
      };

    } catch (error) {
      console.error('Error validating campaign templates:', error);
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || 'Error validating campaign templates'
      });
    }
  }, event);
});