import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;

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
      console.log(`🔐 Obteniendo lead interactions para tenant: ${tenantContext.tenant_name}`);
      
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

      // Main query with lead profile data and tenant isolation
      const baseQuery = `
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
        JOIN tenant_members tm ON p.id = tm.user_id
        ${whereClause}
        ORDER BY li.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      const { query: interactionsQuery, params: finalParams } = addTenantFilterSimple(
        baseQuery.replace(`LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, ''),
        tenantContext,
        queryParams
      );
      
      const finalInteractionsQuery = interactionsQuery + ` ORDER BY li.created_at DESC LIMIT $${finalParams.length + 1} OFFSET $${finalParams.length + 2}`;
      finalParams.push(parseInt(limit));
      finalParams.push(parseInt(offset));

      const result = await client.query(finalInteractionsQuery, finalParams);

      // Get total count for pagination with tenant isolation
      const baseCountQuery = `
        SELECT COUNT(*) as total
        FROM lead_interactions li
        LEFT JOIN leads l ON li.lead_id = l.id
        LEFT JOIN profile p ON l.profile_id = p.id
        JOIN tenant_members tm ON p.id = tm.user_id
        ${whereClause}
      `;

      const { query: countQuery, params: countParams } = addTenantFilterSimple(
        baseCountQuery, 
        tenantContext, 
        queryParams.slice(0, -2) // Remove limit and offset
      );
      
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