// server/api/templates/[id].get.js
import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const templateId = event.context.params.id;
  const tenantContext = event.context.tenant;

  if (!templateId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Template ID is required'
    });
  }

  return await withPostgresClient(async (client) => {
    try {
      console.log(`🔐 Consultando template ${templateId} para tenant: ${tenantContext.tenant_name}`);
      
      // Template individual con tenant isolation usando created_by_profile_id
      const baseQuery = `
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
          ) as versions,
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
        JOIN profile p ON t.created_by_profile_id = p.id
        JOIN tenant_members tm ON p.id = tm.user_id
        WHERE t.id = $1 AND t.is_deleted = false
      `;

      // Apply tenant filter
      const { query, params } = addTenantFilterSimple(baseQuery, tenantContext, [templateId]);
      
      console.log(`🏢 Verificando acceso a template ${templateId} para tenant: ${tenantContext.tenant_name}`);
      const result = await client.query(query, params);

      if (result.rows.length === 0) {
        console.log(`❌ Template ${templateId} no encontrado o sin acceso para tenant: ${tenantContext.tenant_name}`);
        throw createError({
          statusCode: 404,
          statusMessage: 'Template not found or access denied'
        });
      }
      
      console.log(`✅ Template ${templateId} encontrado para tenant: ${tenantContext.tenant_name}`);
      return {
        success: true,
        data: result.rows[0],
        tenant_info: {
          tenant_id: tenantContext.tenant_id,
          tenant_name: tenantContext.tenant_name,
          user_role: tenantContext.role,
          is_superuser: tenantContext.is_superuser
        }
      };

    } catch (error) {
      console.error(`Error fetching template ${templateId} para tenant ${tenantContext.tenant_name}:`, error);
      if (error.statusCode) {
        throw error; // Re-throw known errors
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Error fetching template detail'
      });
    }
  }, event);
});