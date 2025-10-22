import { defineEventHandler, readBody } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient.js';
import { getRoleFields } from '../../utils/profiles/roleSchemas.js';

export default defineEventHandler(async (event) => {
  try {
    // Always use body for consistency
    const body = await readBody(event);
    const { site, user_id } = body;

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

    console.log(`👤 Getting profile for user ID ${user_id} on site ${site}...`);

    const result = await withPostgresClient(async (client) => {
      // Direct query: user_id → site → role (no stored procedure needed)
      const profileResult = await client.query(`
        SELECT 
          p.id,
          p.name,
          p.email,
          p.description,
          p.website,
          p.city,
          p.logo_avatar,
          p.banner,
          p.category,
          p.enterprise,
          p.user_name,
          p.created_at,
          p.updated_at,
          tmr.site_role_name,
          tmr.is_active,
          tm.id as tenant_member_id,
          t.id as tenant_id,
          t.name as tenant_name,
          t.slug as tenant_slug
        FROM profile p
        JOIN tenant_members tm ON p.id = tm.user_id
        JOIN tenant_member_roles tmr ON tm.id = tmr.tenant_member_id
        JOIN tenants t ON tm.tenant_id = t.id
        WHERE p.id = $1 AND tmr.site = $2 AND tmr.is_active = true
      `, [user_id, site]);

      if (profileResult.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: `No role found for user on site ${site}`
        });
      }

      const userData = profileResult.rows[0];
      
      // Build profile data in expected format
      const profileData = {
        profile: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          description: userData.description,
          website: userData.website,
          city: userData.city,
          logo_avatar: userData.logo_avatar,
          banner: userData.banner,
          category: userData.category,
          enterprise: userData.enterprise,
          user_name: userData.user_name,
          created_at: userData.created_at,
          updated_at: userData.updated_at
        },
        site_role: {
          role_name: userData.site_role_name,
          is_active: userData.is_active,
          site: site
        },
        tenant: {
          id: userData.tenant_id,
          name: userData.tenant_name,
          slug: userData.tenant_slug
        }
      };

      // Get role-specific data from tenant_member_role_data table (excluding soft deleted)
      const roleDataResult = await client.query(`
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
      `, [userData.tenant_member_id, site]);

      // Convert role data to object
      const roleSpecificData = {};
      roleDataResult.rows.forEach(row => {
        let value = row.field_value;
        
        // Parse value based on type
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
        
        roleSpecificData[row.field_name] = {
          value: value,
          type: row.field_type,
          updated_at: row.updated_at
        };
      });

      return {
        base_profile: profileData,
        role_specific_data: roleSpecificData,
        role: profileData.site_role.role_name,
        site: site,
        permissions: {
          can_edit: true, // User can always edit their own profile
          role_fields: getRoleFields(profileData.site_role.role_name)
        }
      };
    }, event);

    console.log(`✅ Profile retrieved for user ID ${user_id} as ${result.role}`);

    return {
      success: true,
      message: `Profile retrieved for ${site}`,
      data: result
    };

  } catch (error) {
    console.error('❌ Failed to get profile:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to get profile: ${error.message}`
    });
  }
});