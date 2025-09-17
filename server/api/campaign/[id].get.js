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
      const query = `
        SELECT 
          c.id,
          c.name,
          c.slug,
          c.status,
          c.created_at,
          c.updated_at,
          c.profile_id,
          p.name as profile_name,
          t.pair_id,
          t.name as template_pair_name,
          t.description as template_pair_description,
          tm.tenant_id,
          tn.name as tenant_name
        FROM campaign c
        LEFT JOIN profile p ON c.profile_id = p.id
        LEFT JOIN campaign_template_versions ctv ON c.id = ctv.campaign_id
        LEFT JOIN template_versions tv ON ctv.template_version_id = tv.id
        LEFT JOIN templates t ON tv.template_id = t.id AND t.template_type = 'email'
        LEFT JOIN tenant_members tm ON p.id = tm.user_id
        LEFT JOIN tenants tn ON tm.tenant_id = tn.id
        WHERE c.id = $1 AND (c.is_deleted = false OR c.is_deleted IS NULL)
        LIMIT 1
      `;

      const result = await client.query(query, [campaignId]);
      
      if (result.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Campaign not found or has been deleted'
        });
      }

      return {
        success: true,
        data: result.rows[0]
      };

    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Error fetching campaign data'
      });
    }
  }, event);
});