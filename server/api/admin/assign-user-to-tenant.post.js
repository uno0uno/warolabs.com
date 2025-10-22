import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, tenantSlug, role } = body;

    if (!email || !tenantSlug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and tenantSlug are required'
      });
    }

    console.log(`👤 Assigning ${email} to tenant ${tenantSlug} with role ${role || 'member'}`);

    const result = await withPostgresClient(async (client) => {
      // Get user
      const userQuery = 'SELECT id, email, name FROM profile WHERE email = $1';
      const userResult = await client.query(userQuery, [email]);
      
      if (userResult.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'User not found'
        });
      }

      const user = userResult.rows[0];

      // Get tenant
      const tenantQuery = 'SELECT id, name, slug FROM tenants WHERE slug = $1';
      const tenantResult = await client.query(tenantQuery, [tenantSlug]);
      
      if (tenantResult.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Tenant not found'
        });
      }

      const tenant = tenantResult.rows[0];

      // Check if already a member
      const memberQuery = 'SELECT * FROM tenant_members WHERE user_id = $1 AND tenant_id = $2';
      const memberResult = await client.query(memberQuery, [user.id, tenant.id]);

      if (memberResult.rows.length > 0) {
        return {
          message: `User ${email} is already a member of tenant ${tenant.name}`,
          user: user,
          tenant: tenant,
          existing: true
        };
      }

      // Add as member
      const insertQuery = `
        INSERT INTO tenant_members (id, user_id, tenant_id, role)
        VALUES (gen_random_uuid(), $1, $2, $3)
        RETURNING *
      `;
      const insertResult = await client.query(insertQuery, [user.id, tenant.id, role || 'member']);

      return {
        message: `User ${email} successfully added to tenant ${tenant.name}`,
        user: user,
        tenant: tenant,
        membership: insertResult.rows[0],
        existing: false
      };
    }, event);

    console.log(`✅ User assignment completed: ${result.message}`);

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('❌ Failed to assign user to tenant:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to assign user: ${error.message}`,
      data: error.data || {}
    });
  }
});