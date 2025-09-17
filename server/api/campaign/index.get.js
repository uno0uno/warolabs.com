import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';

export default defineEventHandler(async (event) => {
  return await withPostgresClient(async (client) => {
    try {
      // Authentication is commented out for testing - uncomment when needed
      // await verifyAuthToken(event);

      const query = `
          SELECT 
            c.id,
            c.name,
            c.status,
            c.created_at,
            c.updated_at,
            c.slug,
            c.profile_id,
            p.website,
            p.enterprise,
            COALESCE(cs.total_leads, 0) AS total_leads,
            COALESCE(cs.total_sends, 0) AS total_sends
          FROM campaign c
          LEFT JOIN profile p ON c.profile_id = p.id
          LEFT JOIN campaign_summary cs ON c.id = cs.campaign_id
          WHERE (c.is_deleted = false OR c.is_deleted IS NULL)
          ORDER BY c.created_at DESC
      `;

      const result = await client.query(query);
      
      return {
        success: true,
        data: result.rows
      };

    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }, event);
});