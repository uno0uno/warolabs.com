import { defineEventHandler, getRouterParam } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const campaignId = getRouterParam(event, 'id');
  const tenantContext = event.context.tenant;
  
  if (!campaignId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Campaign ID is required'
    });
  }

  return await withPostgresClient(async (client) => {
    try {
      if (tenantContext.is_superuser) {
        console.log(`🔓 Superuser consultando campaign ${campaignId}`);
      } else {
        console.log(`🔐 Consultando campaign ${campaignId} para usuario: ${tenantContext.user_id}`);
      }
      let baseQuery = `
        SELECT 
          c.id,
          c.name,
          c.slug,
          c.status,
          c.created_at,
          c.updated_at,
          c.profile_id,
          p.name as profile_name,
          t.pair_id,
          t.name as template_pair_name,
          t.description as template_pair_description
        FROM campaign c
        JOIN profile p ON c.profile_id = p.id
        LEFT JOIN campaign_template_versions ctv ON c.id = ctv.campaign_id AND ctv.is_active = true
        LEFT JOIN template_versions tv ON ctv.template_version_id = tv.id
        LEFT JOIN templates t ON tv.template_id = t.id AND t.template_type = 'email'
        WHERE c.id = $1 AND (c.is_deleted = false OR c.is_deleted IS NULL)
      `;

      let params = [campaignId];
      
      if (!tenantContext.is_superuser) {
        baseQuery += ` AND c.profile_id = $2`;
        params.push(tenantContext.user_id);
      }
      
      const finalQuery = baseQuery + ` LIMIT 1`;

      if (tenantContext.is_superuser) {
        console.log(`🔓 Superuser verificando acceso a campaign ${campaignId}`);
      } else {
        console.log(`🏢 Verificando acceso a campaign ${campaignId} para usuario: ${tenantContext.user_id}`);
      }
      const result = await client.query(finalQuery, params);
      
      if (result.rows.length === 0) {
        console.log(`❌ Campaign ${campaignId} no encontrado o sin acceso para usuario: ${tenantContext.user_id}`);
        throw createError({
          statusCode: 404,
          statusMessage: 'Campaign not found or access denied'
        });
      }

      console.log(`✅ Campaign ${campaignId} encontrado para usuario: ${tenantContext.user_id}`);
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
      console.error(`Error fetching campaign ${campaignId} para tenant ${tenantContext.tenant_name}:`, error);
      if (error.statusCode) {
        throw error; // Re-throw known errors
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Error fetching campaign data'
      });
    }
  }, event);
});