import { defineEventHandler, getRouterParam, readBody, createError } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const campaignId = getRouterParam(event, 'id');
  const body = await readBody(event);
  const tenantContext = event.context.tenant;
  
  if (!campaignId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Campaign ID is required'
    });
  }

  const { name: campaign_name, pair_id, slug, status } = body;

  if (!campaign_name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required field: campaign_name is required'
    });
  }

  return await withPostgresClient(async (client) => {
    try {
      if (tenantContext.is_superuser) {
        console.log(`🔓 Superuser actualizando campaign ${campaignId}`);
      } else {
        console.log(`🔐 Actualizando campaign ${campaignId} para usuario: ${tenantContext.user_id}`);
      }
      
      // Verificar que el usuario tiene acceso al campaign
      let verifyQuery = `
        SELECT c.id 
        FROM campaign c
        WHERE c.id = $1 AND (c.is_deleted = false OR c.is_deleted IS NULL)
      `;
      
      let verifyParams = [campaignId];
      
      if (!tenantContext.is_superuser) {
        verifyQuery += ` AND c.profile_id = $2`;
        verifyParams.push(tenantContext.user_id);
      }
      
      const verifyResult = await client.query(verifyQuery, verifyParams);
      
      if (verifyResult.rows.length === 0) {
        console.log(`❌ Campaign ${campaignId} no encontrado o sin acceso para tenant: ${tenantContext.tenant_name}`);
        throw createError({
          statusCode: 404,
          statusMessage: 'Campaign not found or access denied'
        });
      }

      // Ahora hacer el UPDATE (ya sabemos que tiene acceso)
      let updateFields = ['name = $2'];
      let updateParams = [campaignId, campaign_name];
      let paramIndex = 3;
      
      if (slug !== undefined) {
        updateFields.push(`slug = $${paramIndex}`);
        updateParams.push(slug);
        paramIndex++;
      }
      
      if (status !== undefined) {
        updateFields.push(`status = $${paramIndex}`);
        updateParams.push(status);
        paramIndex++;
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      
      const updateQuery = `
        UPDATE campaign 
        SET ${updateFields.join(', ')}
        WHERE id = $1 AND (is_deleted = false OR is_deleted IS NULL)
        RETURNING *
      `;

      console.log(`📝 Actualizando campaign con: name=${campaign_name}, slug=${slug}, status=${status}`);
      const result = await client.query(updateQuery, updateParams);
      
      // Si hay un pair_id nuevo, actualizar las relaciones de template
      if (pair_id) {
        // Soft delete de las relaciones existentes
        await client.query(
          'UPDATE campaign_template_versions SET is_active = false, deactivated_at = NOW() WHERE campaign_id = $1 AND is_active = true',
          [campaignId]
        );
        
        // Insertar las nuevas relaciones con el nuevo pair
        await client.query(`
          INSERT INTO campaign_template_versions (campaign_id, template_version_id, is_active)
          SELECT $1, t.active_version_id, true
          FROM templates t
          WHERE t.pair_id = $2 AND t.active_version_id IS NOT NULL AND t.is_deleted = false
          ON CONFLICT (campaign_id, template_version_id) 
          DO UPDATE SET is_active = true, deactivated_at = NULL
        `, [campaignId, pair_id]);
      }
      
      if (result.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Campaign not found or has been deleted'
        });
      }

      console.log(`✅ Campaign ${campaignId} actualizado exitosamente para usuario: ${tenantContext.user_id}`);
      return {
        success: true,
        data: result.rows[0],
        message: 'Campaign updated successfully',
        tenant_info: {
          tenant_id: tenantContext.tenant_id,
          tenant_name: tenantContext.tenant_name,
          user_role: tenantContext.role,
          is_superuser: tenantContext.is_superuser
        }
      };

    } catch (error) {
      console.error(`Error updating campaign ${campaignId} para tenant ${tenantContext.tenant_name}:`, error);
      if (error.statusCode) {
        throw error; // Re-throw known errors
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Error updating campaign'
      });
    }
  }, event);
});