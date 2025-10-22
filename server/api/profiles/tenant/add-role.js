import { defineEventHandler, readBody } from 'h3';
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    const { 
      tenant_member_id,
      site,
      role_type,
      role_data = {}
    } = body;

    // Validate required fields
    if (!tenant_member_id || !site || !role_type) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: tenant_member_id, site, role_type'
      });
    }

    // Validate site
    const validSites = ['warolabs.com', 'sksoluciones.com', 'warocol.com'];
    if (!validSites.includes(site)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid site. Must be one of: ${validSites.join(', ')}`
      });
    }

    // Validate role type based on site
    const siteRoles = {
      'warolabs.com': ['attendee', 'artist', 'venue_owner', 'promoter'],
      'sksoluciones.com': ['student', 'instructor', 'business_learner', 'enterprise_admin'],
      'warocol.com': ['community_member', 'moderator', 'expert', 'contributor']
    };

    if (!siteRoles[site].includes(role_type)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid role_type for ${site}. Must be one of: ${siteRoles[site].join(', ')}`
      });
    }

    console.log(`🎭 Adding role '${role_type}' for site '${site}' to tenant member ${tenant_member_id}`);

    const result = await withPostgresClient(async (client) => {
      // 1. Add the role to the tenant member
      const roleResult = await client.query(`
        SELECT * FROM add_tenant_member_role($1, $2, $3)
      `, [tenant_member_id, site, role_type]);

      if (roleResult.rows.length === 0) {
        throw new Error('Failed to create tenant member role');
      }

      const newRole = roleResult.rows[0];
      const roleId = newRole.role_id;

      // 2. Add role-specific data if provided
      const dataResults = [];
      if (Object.keys(role_data).length > 0) {
        for (const [fieldName, fieldConfig] of Object.entries(role_data)) {
          let fieldValue, fieldType, isRequired, isPublic;
          
          // Handle different input formats
          if (typeof fieldConfig === 'object' && fieldConfig !== null) {
            fieldValue = fieldConfig.value;
            fieldType = fieldConfig.type || 'text';
            isRequired = fieldConfig.is_required || false;
            isPublic = fieldConfig.is_public !== false; // default to true
          } else {
            fieldValue = fieldConfig;
            fieldType = 'text';
            isRequired = false;
            isPublic = true;
          }

          // Convert value to string for storage
          if (typeof fieldValue === 'object') {
            fieldValue = JSON.stringify(fieldValue);
            fieldType = 'json';
          } else if (typeof fieldValue === 'number') {
            fieldValue = fieldValue.toString();
            fieldType = 'number';
          } else if (typeof fieldValue === 'boolean') {
            fieldValue = fieldValue.toString();
            fieldType = 'boolean';
          }

          const dataId = await client.query(`
            SELECT add_tenant_member_role_data($1, $2, $3, $4, $5, $6)
          `, [roleId, fieldName, fieldValue, fieldType, isRequired, isPublic]);

          dataResults.push({
            field_name: fieldName,
            field_value: fieldValue,
            field_type: fieldType,
            data_id: dataId.rows[0].add_tenant_member_role_data
          });
        }
      }

      // 3. Get the complete profile for verification
      const completeProfile = await client.query(`
        SELECT get_tenant_member_profile_for_site($1, $2)
      `, [tenant_member_id, site]);

      return {
        role: newRole,
        data_added: dataResults,
        complete_profile: completeProfile.rows[0].get_tenant_member_profile_for_site
      };
    });

    console.log('✅ Role added successfully');

    return {
      success: true,
      message: `Role '${role_type}' added successfully for site '${site}'`,
      data: {
        tenant_member_id: tenant_member_id,
        site: site,
        role_type: role_type,
        role_id: result.role.role_id,
        created_at: result.role.created_at,
        data_fields_added: result.data_added.length,
        complete_profile: result.complete_profile
      }
    };

  } catch (error) {
    console.error('❌ Error adding tenant member role:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    // Handle database constraint errors
    if (error.code === '23503') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tenant member not found'
      });
    }
    
    if (error.code === '23505') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Tenant member already has a role for this site'
      });
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: `Internal server error: ${error.message}`
    });
  }
});