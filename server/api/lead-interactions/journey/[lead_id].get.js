import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation, addTenantFilterSimple } from '../../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;

  const leadId = getRouterParam(event, 'lead_id');

  if (!leadId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Lead ID is required'
    });
  }

  return await withPostgresClient(async (client) => {
    try {
      // Get lead basic info with tenant isolation
      const baseLeadInfoQuery = `
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
        JOIN tenant_members tm ON p.id = tm.user_id
        WHERE l.id = $1
      `;

      const { query: leadInfoQuery, params: leadInfoParams } = addTenantFilterSimple(baseLeadInfoQuery, tenantContext, [leadId]);
      const leadResult = await client.query(leadInfoQuery, leadInfoParams);
      
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
          li.id,
          li.interaction_type,
          li.source,
          li.medium,
          c.name as campaign,
          li.term,
          li.content,
          li.referrer_url,
          li.ip_address,
          li.user_agent,
          li.created_at,
          li.metadata
        FROM lead_interactions li
        LEFT JOIN campaign c ON li.campaign_id = c.id
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

      // Get campaign engagement if any with tenant isolation
      const baseCampaignEngagementQuery = `
        SELECT 
          c.name as campaign,
          li.campaign_id,
          COUNT(*) as total_interactions,
          COUNT(CASE WHEN li.interaction_type = 'email_open' THEN 1 END) as email_opens,
          COUNT(CASE WHEN li.interaction_type = 'email_click' THEN 1 END) as email_clicks,
          MIN(li.created_at) as first_engagement,
          MAX(li.created_at) as last_engagement
        FROM lead_interactions li
        JOIN campaign c ON li.campaign_id = c.id
        JOIN profile cp ON c.profile_id = cp.id
        JOIN tenant_members ctm ON cp.id = ctm.user_id
        WHERE li.lead_id = $1 AND li.campaign_id IS NOT NULL
        GROUP BY c.name, li.campaign_id
        ORDER BY first_engagement ASC
      `;

      const { query: campaignEngagementQuery, params: campaignEngagementParams } = addTenantFilterSimple(baseCampaignEngagementQuery, tenantContext, [leadId]);
      const campaignResult = await client.query(campaignEngagementQuery, campaignEngagementParams);

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