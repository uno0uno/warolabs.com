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
    lead_id,
    interaction_type,
    source,
    medium,
    campaign,
    limit = 50,
    offset = 0,
    start_date,
    end_date
  } = query;

  return await withPostgresClient(async (client) => {
    try {
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      // Build dynamic WHERE clause
      if (lead_id) {
        whereConditions.push(`li.lead_id = $${paramIndex}`);
        queryParams.push(lead_id);
        paramIndex++;
      }

      if (interaction_type) {
        whereConditions.push(`li.interaction_type = $${paramIndex}`);
        queryParams.push(interaction_type);
        paramIndex++;
      }

      if (source) {
        whereConditions.push(`li.source = $${paramIndex}`);
        queryParams.push(source);
        paramIndex++;
      }

      if (medium) {
        whereConditions.push(`li.medium = $${paramIndex}`);
        queryParams.push(medium);
        paramIndex++;
      }

      if (campaign) {
        whereConditions.push(`li.campaign = $${paramIndex}`);
        queryParams.push(campaign);
        paramIndex++;
      }

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

      // Main query with lead profile data
      const interactionsQuery = `
        SELECT 
          li.id,
          li.lead_id,
          li.interaction_type,
          li.source,
          li.medium,
          li.campaign,
          li.term,
          li.content,
          li.referrer_url,
          li.ip_address,
          li.user_agent,
          li.created_at,
          li.metadata,
          p.email,
          p.name,
          p.company
        FROM lead_interactions li
        LEFT JOIN leads l ON li.lead_id = l.id
        LEFT JOIN profile p ON l.profile_id = p.id
        ${whereClause}
        ORDER BY li.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(parseInt(limit));
      queryParams.push(parseInt(offset));

      const result = await client.query(interactionsQuery, queryParams);

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM lead_interactions li
        LEFT JOIN leads l ON li.lead_id = l.id
        ${whereClause}
      `;

      const countParams = queryParams.slice(0, -2); // Remove limit and offset
      const countResult = await client.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].total);

      return {
        success: true,
        data: result.rows,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      };

    } catch (error) {
      console.error('Error fetching lead interactions:', error);
      throw error;
    }
  }, event);
});