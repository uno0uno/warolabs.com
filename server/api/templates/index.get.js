// server/api/templates/index.get.js
import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';

export default defineEventHandler(async (event) => {
  return await withPostgresClient(async (client) => {
    try {
      const query = `
        SELECT 
          t.id,
          t.template_name as name,
          t.description,
          t.created_at,
          t.sender_email,
          t.template_type
        FROM templates t
        WHERE t.template_type ILIKE '%email%'
        ORDER BY t.created_at DESC;
      `;

      const result = await client.query(query);
      
      return {
        success: true,
        data: result.rows
      };

    } catch (error) {
      console.error('Error fetching templates list:', error);
      throw error;
    }
  }, event);
});