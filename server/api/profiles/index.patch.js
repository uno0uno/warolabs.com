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

    console.log(`🔄 Restoring soft-deleted fields [${field_names.join(', ')}] for user ID ${user_id} on site ${site}...`);

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
        // Restore the specified soft-deleted fields
        const restorePromises = field_names.map(fieldName => 
          client.query(`
            UPDATE tenant_member_role_data 
            SET deleted_at = NULL 
            WHERE tenant_member_role_id = $1 
            AND field_name = $2 
            AND deleted_at IS NOT NULL
          `, [roleId, fieldName])
        );

        const restoreResults = await Promise.all(restorePromises);
        
        // Count how many fields were actually restored
        const restoredCount = restoreResults.reduce((sum, result) => sum + result.rowCount, 0);

        // Commit transaction
        await client.query('COMMIT');

        // Get updated profile data to return
        const updatedProfileResult = await client.query(
          'SELECT get_tenant_member_profile_for_site($1, $2)', 
          [user_id, site]
        );

        // Get the restored field data
        const restoredFieldsResult = await client.query(`
          SELECT 
            tmrd.field_name,
            tmrd.field_value,
            tmrd.field_type,
            tmrd.updated_at
          FROM tenant_member_role_data tmrd
          JOIN tenant_member_roles tmr ON tmrd.tenant_member_role_id = tmr.id
          WHERE tmr.tenant_member_id = $1 
          AND tmr.site = $2
          AND tmr.is_active = true
          AND tmrd.deleted_at IS NULL
          AND tmrd.field_name = ANY($3)
          ORDER BY tmrd.field_name
        `, [user_id, site, field_names]);

        const restoredFields = {};
        restoredFieldsResult.rows.forEach(row => {
          let value = row.field_value;
          
          try {
            if (row.field_type === 'json') {
              value = JSON.parse(value);
            } else if (row.field_type === 'number') {
              value = parseFloat(value);
            } else if (row.field_type === 'boolean') {
              value = value === 'true';
            }
          } catch (error) {
            console.warn(`Failed to parse field ${row.field_name}:`, error);
          }
          
          restoredFields[row.field_name] = {
            value: value,
            type: row.field_type,
            updated_at: row.updated_at
          };
        });

        return {
          requested_fields: field_names,
          fields_restored_count: restoredCount,
          fields_not_found: field_names.length - restoredCount,
          restored_fields: restoredFields,
          updated_profile: updatedProfileResult.rows[0]?.get_tenant_member_profile_for_site,
          site: site
        };

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }, event);

    console.log(`✅ Restored ${result.fields_restored_count} fields for user ID ${user_id}`);

    return {
      success: true,
      message: `Fields restored successfully for ${site}`,
      data: result
    };

  } catch (error) {
    console.error('❌ Failed to restore profile fields:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to restore fields: ${error.message}`,
      data: error.data || {}
    });
  }
});