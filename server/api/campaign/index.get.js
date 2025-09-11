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
          COALESCE(lead_counts.total_leads, 0) as total_leads,
          COALESCE(send_counts.total_sends, 0) as total_sends
        FROM campaign c
        LEFT JOIN (
          SELECT 
            cl.campaign_id, 
            COUNT(cl.lead_id) as total_leads
          FROM campaign_leads cl
          GROUP BY cl.campaign_id
        ) lead_counts ON c.id = lead_counts.campaign_id
        LEFT JOIN (
          SELECT 
            es.campaign_id, 
            COUNT(es.id) as total_sends
          FROM email_sends es
          GROUP BY es.campaign_id
        ) send_counts ON c.id = send_counts.campaign_id
        ORDER BY c.created_at DESC;
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