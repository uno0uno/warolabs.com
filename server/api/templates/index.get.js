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
          t.id,
          t.template_name as name,
          t.description,
          t.created_at,
          t.subject_template,
          t.sender_email,
          t.template_type,
          jsonb_build_object(
            'id', tv.id,
            'content', tv.content,
            'version_number', tv.version_number,
            'created_at', tv.created_at
          ) as active_version
        FROM templates t
        LEFT JOIN template_versions tv ON t.active_version_id = tv.id
        WHERE t.template_type ILIKE '%email%'
        ORDER BY t.created_at DESC;
      `;

      const result = await client.query(query);
      
      return {
        success: true,
        data: result.rows
      };

    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }, event);
});