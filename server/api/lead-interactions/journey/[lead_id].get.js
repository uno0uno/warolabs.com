import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient';
import { verifyAuthToken } from '../../../utils/security/jwtVerifier';

export default defineEventHandler(async (event) => {
  try {
    await verifyAuthToken(event);
  } catch (error) {
    throw error;
  }

  const leadId = getRouterParam(event, 'lead_id');

  if (!leadId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Lead ID is required'
    });
  }

  return await withPostgresClient(async (client) => {
    try {
      // Get lead basic info
      const leadInfoQuery = `
        SELECT 
          l.id,
          l.created_at as lead_created_at,
          l.converted_at,
          l.is_verified,
          p.email,
          p.name,
          p.company,
          p.phone,
          p.position,
          p.country
        FROM leads l
        LEFT JOIN profile p ON l.profile_id = p.id
        WHERE l.id = $1
      `;

      const leadResult = await client.query(leadInfoQuery, [leadId]);
      
      if (leadResult.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Lead not found'
        });
      }

      const leadInfo = leadResult.rows[0];

      // Get all interactions for this lead
      const interactionsQuery = `
        SELECT 
          id,
          interaction_type,
          source,
          medium,
          campaign,
          term,
          content,
          referrer_url,
          ip_address,
          user_agent,
          created_at,
          metadata
        FROM lead_interactions
        WHERE lead_id = $1
        ORDER BY created_at ASC
      `;

      const interactionsResult = await client.query(interactionsQuery, [leadId]);

      // Get interaction summary
      const summaryQuery = `
        SELECT 
          interaction_type,
          COUNT(*) as count,
          MIN(created_at) as first_occurrence,
          MAX(created_at) as last_occurrence
        FROM lead_interactions
        WHERE lead_id = $1
        GROUP BY interaction_type
        ORDER BY first_occurrence ASC
      `;

      const summaryResult = await client.query(summaryQuery, [leadId]);

      // Get campaign engagement if any
      const campaignEngagementQuery = `
        SELECT 
          campaign,
          COUNT(*) as total_interactions,
          COUNT(CASE WHEN interaction_type = 'email_open' THEN 1 END) as email_opens,
          COUNT(CASE WHEN interaction_type = 'email_click' THEN 1 END) as email_clicks,
          MIN(created_at) as first_engagement,
          MAX(created_at) as last_engagement
        FROM lead_interactions
        WHERE lead_id = $1 AND campaign IS NOT NULL
        GROUP BY campaign
        ORDER BY first_engagement ASC
      `;

      const campaignResult = await client.query(campaignEngagementQuery, [leadId]);

      // Calculate journey metrics
      const journeyStats = {
        total_interactions: interactionsResult.rows.length,
        journey_duration_days: leadInfo.converted_at 
          ? Math.ceil((new Date(leadInfo.converted_at) - new Date(leadInfo.lead_created_at)) / (1000 * 60 * 60 * 24))
          : Math.ceil((new Date() - new Date(leadInfo.lead_created_at)) / (1000 * 60 * 60 * 24)),
        is_converted: !!leadInfo.converted_at,
        is_verified: leadInfo.is_verified,
        unique_sources: [...new Set(interactionsResult.rows.map(i => i.source).filter(Boolean))],
        unique_campaigns: [...new Set(interactionsResult.rows.map(i => i.campaign).filter(Boolean))]
      };

      return {
        success: true,
        data: {
          lead_info: leadInfo,
          journey_stats: journeyStats,
          interactions: interactionsResult.rows,
          interaction_summary: summaryResult.rows,
          campaign_engagement: campaignResult.rows
        }
      };

    } catch (error) {
      console.error('Error fetching lead journey:', error);
      throw error;
    }
  }, event);
});