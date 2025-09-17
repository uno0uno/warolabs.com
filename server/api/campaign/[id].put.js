import { defineEventHandler, getRouterParam, readBody } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  const campaignId = getRouterParam(event, 'id');
  const body = await readBody(event);
  
  if (!campaignId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Campaign ID is required'
    });
  }

  const { campaign_name, pair_id, profile_id } = body;

  if (!campaign_name || !profile_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: campaign_name and profile_id are required'
    });
  }

  return await withPostgresClient(async (client) => {
    try {
      // Solo actualizar los campos que existen en la tabla campaign
      const query = `
        UPDATE campaign 
        SET 
          name = $2,
          profile_id = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND (is_deleted = false OR is_deleted IS NULL)
        RETURNING *
      `;

      const result = await client.query(query, [
        campaignId,
        campaign_name,
        profile_id
      ]);
      
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

      return {
        success: true,
        data: result.rows[0],
        message: 'Campaign updated successfully'
      };

    } catch (error) {
      console.error('Error updating campaign:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Error updating campaign'
      });
    }
  }, event);
});