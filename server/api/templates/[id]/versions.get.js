import { defineEventHandler, getRouterParam } from 'h3';
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient';
import { verifyAuthToken } from '../../../utils/security/jwtVerifier';

export default defineEventHandler(async (event) => {
  return await withPostgresClient(async (client) => {
    try {
      // Authentication is commented out for testing - uncomment when needed
      // await verifyAuthToken(event);

      const templateId = getRouterParam(event, 'id');
      
      if (!templateId) {
        throw new Error('Template ID is required');
      }

      const query = `
        SELECT 
          tv.id,
          tv.template_id,
          tv.version_number,
          tv.content,
          tv.created_at,
          t.active_version_id = tv.id as is_active
        FROM template_versions tv
        JOIN templates t ON tv.template_id = t.id
        WHERE tv.template_id = $1
        ORDER BY tv.version_number DESC;
      `;

      const result = await client.query(query, [templateId]);
      
      return {
        success: true,
        data: result.rows
      };

    } catch (error) {
      console.error('Error fetching template versions:', error);
      throw error;
    }
  }, event);
});