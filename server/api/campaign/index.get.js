import { defineEventHandler, createError } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;
  
  return await withPostgresClient(async (client) => {
    try {
      if (tenantContext.is_superuser) {
        console.log(`🔓 Superuser consultando todas las campaigns`);
      } else {
        console.log(`🔐 Consultando campaigns para usuario: ${tenantContext.user_id}`);
      }

      let baseQuery = `
          SELECT 
            c.id,
            c.name,
            c.status,
            c.created_at,
            c.updated_at,
            c.slug,
            c.profile_id,
            p.name as profile_name,
            p.website,
            p.enterprise,
            COALESCE(cl.total_leads, 0) AS total_leads,
            COALESCE(li.total_sends, 0) AS total_sends
          FROM campaign c
          JOIN profile p ON c.profile_id = p.id
          LEFT JOIN (
            SELECT campaign_id, COUNT(*) AS total_leads
            FROM campaign_leads
            GROUP BY campaign_id
          ) cl ON c.id = cl.campaign_id
          LEFT JOIN (
            SELECT campaign_id, COUNT(*) AS total_sends
            FROM lead_interactions
            WHERE interaction_type = 'email_sent'
            GROUP BY campaign_id
          ) li ON c.id = li.campaign_id
          WHERE (c.is_deleted = false OR c.is_deleted IS NULL)
      `;

      let params = [];
      
      if (!tenantContext.is_superuser) {
        baseQuery += ` AND c.profile_id = $1`;
        params.push(tenantContext.user_id);
      }
      
      const finalQuery = baseQuery + ` ORDER BY c.created_at DESC`;
      
      console.log(`👑 Es superuser: ${tenantContext.is_superuser ? 'Sí (ve todas las campaigns)' : 'No (solo sus campaigns)'}`);

      const result = await client.query(finalQuery, params);
      
      return {
        success: true,
        data: result.rows,
        tenant_info: {
          tenant_id: tenantContext.tenant_id,
          tenant_name: tenantContext.tenant_name,
          user_role: tenantContext.role,
          is_superuser: tenantContext.is_superuser,
          total_campaigns: result.rows.length
        }
      };

    } catch (error) {
      console.error(`Error fetching campaigns para tenant ${tenantContext.tenant_name}:`, error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Error obteniendo campaigns'
      });
    }
  });
});