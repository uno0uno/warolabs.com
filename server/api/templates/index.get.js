// server/api/templates/index.get.js
import { defineEventHandler, createError } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;
  
  return await withPostgresClient(async (client) => {
    try {
      console.log(`🔐 Consultando templates para tenant: ${tenantContext.tenant_name}`);
      console.log(`👑 Es superuser: ${tenantContext.is_superuser}`);
      console.log(`🆔 Tenant ID: ${tenantContext.tenant_id}`);
      
      let baseQuery;
      let params;

      if (tenantContext.is_superuser) {
        // Superuser sees all templates
        console.log('🔓 Superuser access: showing all templates');
        baseQuery = `
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
            END as pair_templates,
            -- Indicar si el template tiene campañas asociadas
            CASE 
              WHEN EXISTS (
                SELECT 1 FROM template_versions tv
                JOIN campaign_template_versions ctv ON tv.id = ctv.template_version_id
                WHERE tv.template_id = t.id AND ctv.is_active = true
              ) THEN true
              ELSE false
            END as has_campaigns
          FROM templates t
          WHERE t.template_type IN ('email', 'landing', 'massive_email', 'transactional_email', 'notification_email', 'welcome_email', 'landing_confirmation')
          AND t.is_deleted = false
          ORDER BY 
            COALESCE(t.pair_id::text, t.id::text),
            t.template_type ASC,
            t.created_at DESC
        `;
        params = [];
      } else {
        // Other users only see their own templates
        console.log(`🔒 User access: showing templates created by ${tenantContext.user_id}`);
        baseQuery = `
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
            END as pair_templates,
            -- Indicar si el template tiene campañas asociadas
            CASE 
              WHEN EXISTS (
                SELECT 1 FROM template_versions tv
                JOIN campaign_template_versions ctv ON tv.id = ctv.template_version_id
                WHERE tv.template_id = t.id AND ctv.is_active = true
              ) THEN true
              ELSE false
            END as has_campaigns
          FROM templates t
          WHERE t.template_type IN ('email', 'landing', 'massive_email', 'transactional_email', 'notification_email', 'welcome_email', 'landing_confirmation')
          AND t.is_deleted = false
          AND t.profile_id = $1
          ORDER BY 
            COALESCE(t.pair_id::text, t.id::text),
            t.template_type ASC,
            t.created_at DESC
        `;
        params = [tenantContext.user_id];
      }
      
      console.log(`🏢 Aplicando filtro de ownership para: ${tenantContext.tenant_name}`);
      const result = await client.query(baseQuery, params);
      
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
      
      console.log(`✅ Encontrados ${groupedTemplates.length} templates/pares para tenant: ${tenantContext.tenant_name}`);
      return {
        success: true,
        data: groupedTemplates,
        tenant_info: {
          tenant_id: tenantContext.tenant_id,
          tenant_name: tenantContext.tenant_name,
          user_role: tenantContext.role,
          is_superuser: tenantContext.is_superuser,
          total_templates: groupedTemplates.length
        }
      };

    } catch (error) {
      console.error(`Error fetching templates para tenant ${tenantContext.tenant_name}:`, error);
      if (error.statusCode) {
        throw error; // Re-throw known errors
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Error fetching templates'
      });
    }
  });
});