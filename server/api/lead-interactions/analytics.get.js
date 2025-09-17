import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';

export default defineEventHandler(async (event) => {
  try {
    await verifyAuthToken(event);
  } catch (error) {
    throw error;
  }

  const query = getQuery(event);
  const {
    start_date,
    end_date,
    group_by = 'interaction_type' // source, medium, campaign, interaction_type, date
  } = query;

  return await withPostgresClient(async (client) => {
    try {
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
          groupByField = 'li.campaign';
          selectField = 'li.campaign as group_key';
          break;
        case 'date':
          groupByField = 'DATE(li.created_at)';
          selectField = 'DATE(li.created_at) as group_key';
          break;
        default: // interaction_type
          groupByField = 'li.interaction_type';
          selectField = 'li.interaction_type as group_key';
      }

      analyticsQuery = `
        SELECT 
          ${selectField},
          COUNT(*) as total_interactions,
          COUNT(DISTINCT li.lead_id) as unique_leads,
          MIN(li.created_at) as first_interaction,
          MAX(li.created_at) as last_interaction
        FROM lead_interactions li
        ${whereClause}
        GROUP BY ${groupByField}
        ORDER BY total_interactions DESC
      `;

      const analyticsResult = await client.query(analyticsQuery, queryParams);

      // Get overall metrics
      const overallQuery = `
        SELECT 
          COUNT(*) as total_interactions,
          COUNT(DISTINCT lead_id) as unique_leads,
          COUNT(DISTINCT source) as unique_sources,
          COUNT(DISTINCT medium) as unique_mediums,
          COUNT(DISTINCT campaign) as unique_campaigns,
          MIN(created_at) as first_interaction,
          MAX(created_at) as last_interaction
        FROM lead_interactions li
        ${whereClause}
      `;

      const overallResult = await client.query(overallQuery, queryParams);

      // Get interaction types breakdown
      const typesQuery = `
        SELECT 
          interaction_type,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM lead_interactions li
        ${whereClause}
        GROUP BY interaction_type
        ORDER BY count DESC
      `;

      const typesResult = await client.query(typesQuery, queryParams);

      // Get top sources/mediums/campaigns
      const topSourcesQuery = `
        SELECT 
          source,
          COUNT(*) as interactions,
          COUNT(DISTINCT lead_id) as unique_leads
        FROM lead_interactions li
        ${whereClause}
        AND source IS NOT NULL
        GROUP BY source
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