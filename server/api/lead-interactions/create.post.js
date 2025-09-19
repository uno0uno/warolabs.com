import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;
  const body = await readBody(event);
  const {
    lead_id,
    interaction_type,
    source,
    medium,
    campaign_id,
    term,
    content,
    referrer_url,
    ip_address,
    user_agent,
    metadata = {}
  } = body;

  // Validate required fields
  if (!lead_id || !interaction_type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'lead_id and interaction_type are required'
    });
  }

  return await withPostgresClient(async (client) => {
    try {
      console.log(`🔐 Creando lead interaction para tenant: ${tenantContext.tenant_name}`);
      
      // Verificar que el lead pertenece al tenant
      const verifyLeadQuery = `
        SELECT l.id 
        FROM leads l
        JOIN profile p ON l.profile_id = p.id
        JOIN tenant_members tm ON p.id = tm.user_id
        WHERE l.id = $1
      `;
      
      const { query: verifyQuery, params: verifyParams } = addTenantFilterSimple(
        verifyLeadQuery, 
        tenantContext, 
        [lead_id]
      );
      
      const verifyResult = await client.query(verifyQuery, verifyParams);
      
      if (verifyResult.rows.length === 0) {
        console.log(`❌ Lead ${lead_id} no encontrado o sin acceso para tenant: ${tenantContext.tenant_name}`);
        throw createError({
          statusCode: 404,
          statusMessage: 'Lead not found or access denied'
        });
      }
      
      const insertQuery = `
        INSERT INTO lead_interactions (
          lead_id,
          interaction_type,
          source,
          medium,
          campaign_id,
          term,
          content,
          referrer_url,
          ip_address,
          user_agent,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, created_at
      `;

      const values = [
        lead_id,
        interaction_type,
        source || null,
        medium || null,
        campaign_id || null,
        term || null,
        content || null,
        referrer_url || null,
        ip_address || null,
        user_agent || null,
        JSON.stringify(metadata)
      ];

      const result = await client.query(insertQuery, values);

      return {
        success: true,
        message: 'Lead interaction created successfully',
        data: {
          id: result.rows[0].id,
          created_at: result.rows[0].created_at,
          lead_id,
          interaction_type
        }
      };

    } catch (error) {
      console.error('Error creating lead interaction:', error);
      throw error;
    }
  }, event);
});