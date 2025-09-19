// server/api/templates/massive.get.js
import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;
  return await withPostgresClient(async (client) => {
    try {
      console.log(`🔐 Obteniendo templates masivos para tenant: ${tenantContext.tenant_name}`);
      
      const baseQuery = `
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
                  'template_type', pt.template_type,
                  'name', pt.template_name
                )
              ) FROM templates pt 
               JOIN profile pt_p ON pt.created_by_profile_id = pt_p.id
               JOIN tenant_members pt_tm ON pt_p.id = pt_tm.user_id
               WHERE pt.pair_id = t.pair_id AND pt.is_deleted = false AND pt_tm.tenant_id = tm.tenant_id)
            ELSE NULL 
          END as pair_templates
        FROM templates t
        JOIN profile p ON t.created_by_profile_id = p.id
        JOIN tenant_members tm ON p.id = tm.user_id
        WHERE (
          -- Templates individuales de tipo massive_email
          (t.template_type = 'massive_email' AND t.pair_id IS NULL)
          OR
          -- Pares que contengan al menos un template de tipo massive_email
          (t.pair_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM templates pt 
            JOIN profile pt_p ON pt.created_by_profile_id = pt_p.id
            JOIN tenant_members pt_tm ON pt_p.id = pt_tm.user_id
            WHERE pt.pair_id = t.pair_id 
            AND pt.template_type = 'massive_email' 
            AND pt.is_deleted = false
            AND pt_tm.tenant_id = tm.tenant_id
          ))
        )
        AND t.is_deleted = false
        ORDER BY 
          COALESCE(t.pair_id::text, t.id::text),
          t.template_type ASC,
          t.created_at DESC
      `;

      const { query, params } = addTenantFilterSimple(baseQuery, tenantContext, []);
      const result = await client.query(query, params);
      
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
          // Template individual masivo
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
      console.error('Error fetching massive templates:', error);
      throw error;
    }
  }, event);
});