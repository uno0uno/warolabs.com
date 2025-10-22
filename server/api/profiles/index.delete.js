import { defineEventHandler, readBody } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { site, user_id, field_names } = body;

    if (!site) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Site parameter is required'
      });
    }

    if (!user_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'user_id parameter is required'
      });
    }

    if (!field_names || !Array.isArray(field_names) || field_names.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'field_names array is required and must contain at least one field'
      });
    }

    console.log(`🗑️ Soft deleting fields [${field_names.join(', ')}] for user ID ${user_id} on site ${site}...`);

    const result = await withPostgresClient(async (client) => {
      // Get the role_id for this user and site
      const roleIdResult = await client.query(`
        SELECT id FROM tenant_member_roles
        WHERE tenant_member_id = $1 AND site = $2 AND is_active = true
      `, [user_id, site]);

      if (roleIdResult.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Role assignment not found'
        });
      }

      const roleId = roleIdResult.rows[0].id;

      // Start transaction
      await client.query('BEGIN');

      try {
        // Soft delete the specified fields
        const deletePromises = field_names.map(fieldName => 
          client.query(`
            UPDATE tenant_member_role_data 
            SET deleted_at = NOW() 
            WHERE tenant_member_role_id = $1 
            AND field_name = $2 
            AND deleted_at IS NULL
          `, [roleId, fieldName])
        );

        const deleteResults = await Promise.all(deletePromises);
        
        // Count how many fields were actually deleted
        const deletedCount = deleteResults.reduce((sum, result) => sum + result.rowCount, 0);

        // Commit transaction
        await client.query('COMMIT');

        // Get updated profile data to return
        const updatedProfileResult = await client.query(
          'SELECT get_tenant_member_profile_for_site($1, $2)', 
          [user_id, site]
        );

        return {
          deleted_fields: field_names,
          fields_deleted_count: deletedCount,
          fields_not_found: field_names.length - deletedCount,
          updated_profile: updatedProfileResult.rows[0]?.get_tenant_member_profile_for_site,
          site: site
        };

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }, event);

    console.log(`✅ Soft deleted ${result.fields_deleted_count} fields for user ID ${user_id}`);

    return {
      success: true,
      message: `Fields soft deleted successfully for ${site}`,
      data: result
    };

  } catch (error) {
    console.error('❌ Failed to soft delete profile fields:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to soft delete fields: ${error.message}`,
      data: error.data || {}
    });
  }
});