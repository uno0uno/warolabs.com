import { defineEventHandler, readBody } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient.js';
import { validateRoleData, getRoleFields } from '../../utils/profiles/roleSchemas.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { site, user_id, role_data } = body;

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

    if (!role_data || typeof role_data !== 'object') {
      throw createError({
        statusCode: 400,
        statusMessage: 'role_data object is required'
      });
    }

    console.log(`🔄 Complete profile update for user ID ${user_id} on site ${site}...`);

    const result = await withPostgresClient(async (client) => {
      // Get user's current role for the site
      const profileResult = await client.query(
        'SELECT get_tenant_member_profile_for_site($1, $2)', 
        [user_id, site]
      );

      const profileData = profileResult.rows[0]?.get_tenant_member_profile_for_site;

      if (!profileData || !profileData.site_role?.role_name) {
        throw createError({
          statusCode: 404,
          statusMessage: `No role found for user on site ${site}`
        });
      }

      const userRole = profileData.site_role.role_name;

      // Validate role data against schema
      const validation = validateRoleData(userRole, role_data);
      if (!validation.valid) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Validation failed',
          data: { errors: validation.errors }
        });
      }

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
        // Complete replacement: soft delete ALL existing role data
        await client.query(`
          UPDATE tenant_member_role_data 
          SET deleted_at = NOW() 
          WHERE tenant_member_role_id = $1 
          AND deleted_at IS NULL
        `, [roleId]);

        // Insert new role data (complete replacement)
        const insertPromises = [];
        for (const [fieldName, fieldValue] of Object.entries(role_data)) {
          if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
            // Get field type from schema
            const roleFields = getRoleFields(userRole);
            const fieldSchema = roleFields.find(f => f.name === fieldName);
            const fieldType = fieldSchema?.type || 'text';

            // Convert value to string for storage
            let valueString = fieldValue;
            if (fieldType === 'json' && typeof fieldValue === 'object') {
              valueString = JSON.stringify(fieldValue);
            } else if (fieldType === 'boolean') {
              valueString = fieldValue.toString();
            } else if (fieldType === 'number') {
              valueString = fieldValue.toString();
            }

            insertPromises.push(
              client.query(
                'SELECT add_tenant_member_role_data($1, $2, $3, $4)',
                [roleId, fieldName, valueString, fieldType]
              )
            );
          }
        }

        await Promise.all(insertPromises);

        // Commit transaction
        await client.query('COMMIT');

        // Get updated profile data
        const updatedProfileResult = await client.query(
          'SELECT get_tenant_member_profile_for_site($1, $2)', 
          [user_id, site]
        );

        // Get the new role data to return
        const newRoleDataResult = await client.query(`
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
          ORDER BY tmrd.field_name
        `, [user_id, site]);

        const newRoleSpecificData = {};
        newRoleDataResult.rows.forEach(row => {
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
          
          newRoleSpecificData[row.field_name] = {
            value: value,
            type: row.field_type,
            updated_at: row.updated_at
          };
        });

        return {
          updated_profile: updatedProfileResult.rows[0]?.get_tenant_member_profile_for_site,
          new_role_data: newRoleSpecificData,
          fields_replaced: Object.keys(role_data).length,
          role: userRole,
          site: site,
          operation: 'complete_replacement'
        };

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }, event);

    console.log(`✅ Complete profile replacement for user ID ${user_id} as ${result.role}`);

    return {
      success: true,
      message: `Profile completely updated for ${site}`,
      data: result
    };

  } catch (error) {
    console.error('❌ Failed to completely update profile:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to update profile: ${error.message}`,
      data: error.data || {}
    });
  }
});