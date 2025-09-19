import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;

  const query = getQuery(event);
  const {
    start_date,
    end_date,
    group_by = 'interaction_type' // source, medium, campaign, interaction_type, date
  } = query;

  return await withPostgresClient(async (client) => {
    try {
      console.log(`🔐 Obteniendo analytics para tenant: ${tenantContext.tenant_name}`);
      
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      // Build date filters
      if (start_date) {
        whereConditions.push(`li.created_at >= $${paramIndex}`);
        queryParams.push(start_date);
        paramIndex++;
      }

      if (end_date) {
        whereConditions.push(`li.created_at <= $${paramIndex}`);
        queryParams.push(end_date);
        paramIndex++;
      }

      // Add campaign ownership filter based on user role
      if (tenantContext.is_superuser) {
        // Superuser sees all interactions from all campaigns
        console.log('🔓 Superuser access: showing all lead interactions');
      } else {
        // Other users only see interactions from their own campaigns
        whereConditions.push(`c.profile_id = $${paramIndex}`);
        queryParams.push(tenantContext.user_id);
        paramIndex++;
        console.log(`🔒 User access: showing only campaigns owned by ${tenantContext.user_id}`);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      // Different aggregation queries based on group_by parameter
      let analyticsQuery;
      let groupByField;
      let selectField;

      switch (group_by) {
        case 'source':
          groupByField = 'li.source';
          selectField = 'li.source as group_key';
          break;
        case 'medium':
          groupByField = 'li.medium';
          selectField = 'li.medium as group_key';
          break;
        case 'campaign':
          groupByField = 'COALESCE(c.name, \'Unknown\'), li.campaign_id';
          selectField = 'COALESCE(c.name, \'Unknown\') as group_key, li.campaign_id';
          break;
        case 'date':
          groupByField = 'DATE(li.created_at)';
          selectField = 'DATE(li.created_at) as group_key';
          break;
        default: // interaction_type
          groupByField = 'li.interaction_type';
          selectField = 'li.interaction_type as group_key';
      }

      // Base FROM clause with campaign ownership filtering
      let fromClause = `
        FROM lead_interactions li
        LEFT JOIN campaign c ON li.campaign_id = c.id
      `;

      analyticsQuery = `
        SELECT 
          ${selectField},
          COUNT(*) as total_interactions,
          COUNT(DISTINCT li.lead_id) as unique_leads,
          MIN(li.created_at) as first_interaction,
          MAX(li.created_at) as last_interaction
        ${fromClause}
        ${whereClause}
        GROUP BY ${groupByField}
        ORDER BY total_interactions DESC
      `;

      const analyticsResult = await client.query(analyticsQuery, queryParams);

      // Get overall metrics with campaign ownership filtering
      const overallQuery = `
        SELECT 
          COUNT(*) as total_interactions,
          COUNT(DISTINCT li.lead_id) as unique_leads,
          COUNT(DISTINCT li.source) as unique_sources,
          COUNT(DISTINCT li.medium) as unique_mediums,
          COUNT(DISTINCT li.campaign_id) as unique_campaigns,
          MIN(li.created_at) as first_interaction,
          MAX(li.created_at) as last_interaction
        FROM lead_interactions li
        LEFT JOIN campaign c ON li.campaign_id = c.id
        ${whereClause}
      `;

      const overallResult = await client.query(overallQuery, queryParams);

      // Get interaction types breakdown with campaign ownership filtering
      const typesQuery = `
        SELECT 
          li.interaction_type,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM lead_interactions li
        LEFT JOIN campaign c ON li.campaign_id = c.id
        ${whereClause}
        GROUP BY li.interaction_type
        ORDER BY count DESC
      `;

      const typesResult = await client.query(typesQuery, queryParams);

      // Get top sources with campaign ownership filtering
      const topSourcesQuery = `
        SELECT 
          li.source,
          COUNT(*) as interactions,
          COUNT(DISTINCT li.lead_id) as unique_leads
        FROM lead_interactions li
        LEFT JOIN campaign c ON li.campaign_id = c.id
        ${whereClause}
        ${whereConditions.length > 0 ? 'AND' : 'WHERE'} li.source IS NOT NULL
        GROUP BY li.source
        ORDER BY interactions DESC
        LIMIT 10
      `;

      const topSourcesResult = await client.query(topSourcesQuery, queryParams);

      return {
        success: true,
        data: {
          analytics: analyticsResult.rows,
          overall_metrics: overallResult.rows[0],
          interaction_types: typesResult.rows,
          top_sources: topSourcesResult.rows,
          group_by: group_by,
          date_range: {
            start_date: start_date || null,
            end_date: end_date || null
          }
        }
      };

    } catch (error) {
      console.error('Error fetching interaction analytics:', error);
      throw error;
    }
  }, event);
});