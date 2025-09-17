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
          t.template_type,
          t.pair_id,
          -- Obtener el nombre base del par (sin " - Email" o " - Landing")
          CASE 
            WHEN t.pair_id IS NOT NULL THEN 
              REGEXP_REPLACE(t.template_name, ' - (Email|Landing)$', '')
            ELSE t.template_name 
          END as pair_name,
          -- Obtener información del par completo
          CASE 
            WHEN t.pair_id IS NOT NULL THEN 
              (SELECT json_agg(
                json_build_object(
                  'id', pt.id,
                  'type', pt.template_type,
                  'name', pt.template_name
                )
              ) FROM templates pt WHERE pt.pair_id = t.pair_id AND pt.is_deleted = false)
            ELSE NULL 
          END as pair_templates
        FROM templates t
        WHERE t.template_type IN ('email', 'landing', 'massive_email', 'transactional_email', 'notification_email', 'welcome_email', 'landing_confirmation')
        AND t.is_deleted = false
        ORDER BY 
          COALESCE(t.pair_id::text, t.id::text),
          t.template_type ASC,
          t.created_at DESC;
      `;

      const result = await client.query(query);
      
      // Agrupar templates por pares
      const groupedTemplates = [];
      const seenPairs = new Set();
      
      result.rows.forEach(template => {
        if (template.pair_id && !seenPairs.has(template.pair_id)) {
          // Es un par y no lo hemos procesado
          seenPairs.add(template.pair_id);
          groupedTemplates.push({
            id: template.pair_id,
            name: template.pair_name,
            description: template.description,
            created_at: template.created_at,
            sender_email: template.sender_email,
            template_type: 'pair',
            pair_id: template.pair_id,
            pair_templates: template.pair_templates,
            is_pair: true
          });
        } else if (!template.pair_id) {
          // Template individual
          groupedTemplates.push({
            ...template,
            is_pair: false
          });
        }
      });
      
      return {
        success: true,
        data: groupedTemplates
      };

    } catch (error) {
      console.error('Error fetching templates list:', error);
      throw error;
    }
  }, event);
});