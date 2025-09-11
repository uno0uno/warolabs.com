import { defineEventHandler, getQuery } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  return await withPostgresClient(async (client) => {
    try {
      const query = getQuery(event);
      const { page = 1, limit = 100, search = '', status = '', campaign_id } = query;
      
      // campaign_id es REQUERIDO
      if (!campaign_id) {
        throw new Error('campaign_id is required');
      }
      
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let whereConditions = ['cl.campaign_id = $1'];
      let queryParams = [campaign_id];
      let paramIndex = 2;

      // Add search filter
      if (search) {
        whereConditions.push(`(p.email ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex})`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      // Add status filter
      if (status === 'verified') {
        whereConditions.push(`l.is_active = true`);
      } else if (status === 'unverified') {
        whereConditions.push(`l.is_active = false`);
      }

      const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

      // Main query - SOLO leads de la campaña seleccionada
      const mainQuery = `
        SELECT 
          l.id,
          p.email,
          p.name,
          p.phone_number as phone,
          l.is_active,
          l.created_at,
          cl.created_at as joined_campaign_at
        FROM campaign_leads cl
        JOIN leads l ON cl.lead_id = l.id
        JOIN profile p ON l.profile_id = p.id
        ${whereClause}
        ORDER BY cl.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(parseInt(limit), offset);

      // Count query - contar SOLO leads de la campaña
      const countQuery = `
        SELECT COUNT(*) as total
        FROM campaign_leads cl
        JOIN leads l ON cl.lead_id = l.id
        JOIN profile p ON l.profile_id = p.id
        ${whereClause}
      `;

      const countParams = queryParams.slice(0, -2); // Remove limit and offset

      const [mainResult, countResult] = await Promise.all([
        client.query(mainQuery, queryParams),
        client.query(countQuery, countParams)
      ]);

      const total = parseInt(countResult.rows[0].total);

      return {
        success: true,
        data: mainResult.rows,
        campaign_id: campaign_id,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      };

    } catch (error) {
      console.error('Error fetching campaign leads:', error);
      throw error;
    }
  }, event);
});