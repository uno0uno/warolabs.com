import { defineEventHandler, readBody } from 'h3'
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient'
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation'

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;
  return await withPostgresClient(async (client) => {
    try {
      console.log(`🔐 Buscando emails para tenant: ${tenantContext.tenant_name}`);
      
      const { query, limit = 50 } = await readBody(event);

      if (!query || query.length < 3) {
        return {
          success: false,
          message: 'Query must be at least 3 characters long'
        }
      }

      let baseSearchQuery;
      let searchParams;

      if (tenantContext.is_superuser) {
        // Superuser can search all emails from all campaigns
        console.log('🔓 Superuser access: searching all emails');
        baseSearchQuery = `
          SELECT DISTINCT
            p.email,
            p.name,
            COUNT(li.id) as interaction_count
          FROM profile p
          JOIN leads l ON p.id = l.profile_id
          LEFT JOIN lead_interactions li ON l.id = li.lead_id
          WHERE p.email ILIKE $1
          GROUP BY p.email, p.name
          ORDER BY interaction_count DESC, p.email ASC
          LIMIT $2
        `;
        searchParams = [`%${query}%`, limit];
      } else {
        // Other users only see emails from leads in their own campaigns
        console.log(`🔒 User access: searching emails from campaigns owned by ${tenantContext.user_id}`);
        baseSearchQuery = `
          SELECT DISTINCT
            p.email,
            p.name,
            COUNT(li.id) as interaction_count
          FROM profile p
          JOIN leads l ON p.id = l.profile_id
          LEFT JOIN lead_interactions li ON l.id = li.lead_id
          LEFT JOIN campaign c ON li.campaign_id = c.id
          WHERE p.email ILIKE $1
            AND c.profile_id = $2
          GROUP BY p.email, p.name
          ORDER BY interaction_count DESC, p.email ASC
          LIMIT $3
        `;
        searchParams = [`%${query}%`, tenantContext.user_id, limit];
      }
      
      const result = await client.query(baseSearchQuery, searchParams)

      return {
        success: true,
        data: result.rows
      }
    } catch (error) {
      console.error('Error searching emails:', error)
      return {
        success: false,
        message: 'Error searching emails',
        error: error.message
      }
    }
  });
});