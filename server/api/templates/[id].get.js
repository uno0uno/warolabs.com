// server/api/templates/[id].get.js
import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';

export default defineEventHandler(async (event) => {
  const templateId = event.context.params.id;

  if (!templateId) {
    throw new Error('Template ID is required');
  }

  return await withPostgresClient(async (client) => {
    try {
      // await verifyAuthToken(event);
      
      // ✅ CORREGIDO: Se eliminó la columna `t.updated_at` que no existe.
      const query = `
        SELECT 
          t.id,
          t.template_name as name,
          t.description,
          t.created_at,
          t.subject_template,
          t.sender_email,
          t.template_type,
          t.active_version_id,
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', tv.id,
                'content', tv.content,
                'version_number', tv.version_number,
                'is_active', (tv.id = t.active_version_id),
                'created_at', tv.created_at
              ) ORDER BY tv.version_number DESC
            )
            FROM template_versions tv
            WHERE tv.template_id = t.id
          ) as versions
        FROM templates t
        WHERE t.id = $1;
      `;

      const result = await client.query(query, [templateId]);

      if (result.rows.length === 0) {
        return { success: false, message: 'Template not found', data: null };
      }
      
      return {
        success: true,
        data: result.rows[0]
      };

    } catch (error) {
      console.error(`Error fetching template detail for ID ${templateId}:`, error);
      throw error;
    }
  }, event);
});