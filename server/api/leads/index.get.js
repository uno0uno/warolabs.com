import { defineEventHandler, getQuery } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;
  
  return await withPostgresClient(async (client) => {
    try {
      const query = getQuery(event);
      const { page = 1, limit = 100, search = '', status = '', campaign_id } = query;
      
      // campaign_id es REQUERIDO
      if (!campaign_id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'campaign_id is required'
        });
      }

      console.log(`🔐 Consultando leads de campaign ${campaign_id} para tenant: ${tenantContext.tenant_name}`);
      
      // Primero verificar que el usuario tiene acceso al campaign
      const verifyCampaignQuery = `
        SELECT c.id 
        FROM campaign c
        JOIN profile p ON c.profile_id = p.id
        JOIN tenant_members tm ON p.id = tm.user_id
        WHERE c.id = $1 AND (c.is_deleted = false OR c.is_deleted IS NULL)
      `;
      
      const { query: verifyFinalQuery, params: verifyParams } = addTenantFilterSimple(
        verifyCampaignQuery, 
        tenantContext, 
        [campaign_id]
      );
      
      const verifyResult = await client.query(verifyFinalQuery, verifyParams);
      
      if (verifyResult.rows.length === 0) {
        console.log(`❌ Campaign ${campaign_id} no encontrado o sin acceso para tenant: ${tenantContext.tenant_name}`);
        throw createError({
          statusCode: 404,
          statusMessage: 'Campaign not found or access denied'
        });
      }
      
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let whereConditions = ['cl.campaign_id = $1'];
      let queryParams = [campaign_id];
      let paramIndex = 2;

      // Add search filter
      if (search) {
        whereConditions.push(`(p.email ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex})`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      // Add status filter
      if (status === 'verified') {
        whereConditions.push(`l.is_active = true`);
      } else if (status === 'unverified') {
        whereConditions.push(`l.is_active = false`);
      }

      const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

      // Main query - SOLO leads de la campaña seleccionada
      const mainQuery = `
        SELECT 
          l.id,
          p.email,
          p.name,
          p.phone_number as phone,
          l.is_active,
          l.created_at,
          cl.created_at as joined_campaign_at
        FROM campaign_leads cl
        JOIN leads l ON cl.lead_id = l.id
        JOIN profile p ON l.profile_id = p.id
        ${whereClause}
        ORDER BY cl.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(parseInt(limit), offset);

      // Count query - contar SOLO leads de la campaña
      const countQuery = `
        SELECT COUNT(*) as total
        FROM campaign_leads cl
        JOIN leads l ON cl.lead_id = l.id
        JOIN profile p ON l.profile_id = p.id
        ${whereClause}
      `;

      const countParams = queryParams.slice(0, -2); // Remove limit and offset

      const [mainResult, countResult] = await Promise.all([
        client.query(mainQuery, queryParams),
        client.query(countQuery, countParams)
      ]);

      const total = parseInt(countResult.rows[0].total);

      console.log(`✅ Encontrados ${total} leads en campaign ${campaign_id} para tenant: ${tenantContext.tenant_name}`);
      return {
        success: true,
        data: mainResult.rows,
        campaign_id: campaign_id,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          totalPages: Math.ceil(total / parseInt(limit))
        },
        tenant_info: {
          tenant_id: tenantContext.tenant_id,
          tenant_name: tenantContext.tenant_name,
          user_role: tenantContext.role,
          is_superuser: tenantContext.is_superuser
        }
      };

    } catch (error) {
      console.error(`Error fetching campaign leads para tenant ${tenantContext.tenant_name}:`, error);
      if (error.statusCode) {
        throw error; // Re-throw known errors
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Error fetching campaign leads'
      });
    }
  }, event);
});