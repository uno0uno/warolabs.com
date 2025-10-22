import { defineEventHandler, readBody, createError } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient.js';

export default defineEventHandler(async (event) => {
  try {
    console.log('🔍 Running database queries...');

    const result = await withPostgresClient(async (client) => {
      // Query 1: Check if there are any users with usernames that contain 'saifer' (case insensitive)
      console.log('Query 1: Searching for users with usernames containing "saifer"...');
      const saiferUsersResult = await client.query(`
        SELECT 
          id,
          name,
          email,
          user_name,
          created_at,
          updated_at
        FROM profile 
        WHERE LOWER(user_name) LIKE LOWER($1)
        ORDER BY created_at DESC
      `, ['%saifer%']);

      // Query 2: List all available usernames in the profile table
      console.log('Query 2: Getting all usernames...');
      const allUsernamesResult = await client.query(`
        SELECT 
          id,
          name,
          email,
          user_name,
          created_at
        FROM profile 
        WHERE user_name IS NOT NULL 
        ORDER BY user_name ASC
      `);

      // Query 3: Show which tenants each user belongs to
      console.log('Query 3: Getting user-tenant relationships...');
      const userTenantsResult = await client.query(`
        SELECT 
          p.id as user_id,
          p.name as user_name,
          p.email,
          p.user_name as username,
          t.id as tenant_id,
          t.name as tenant_name,
          t.slug as tenant_slug,
          tm.created_at as joined_at,
          tm.is_active as active_in_tenant
        FROM profile p
        JOIN tenant_members tm ON p.id = tm.user_id
        JOIN tenants t ON tm.tenant_id = t.id
        ORDER BY p.user_name, t.name
      `);

      return {
        query1_saifer_users: {
          description: 'Users with usernames containing "saifer" (case insensitive)',
          count: saiferUsersResult.rows.length,
          results: saiferUsersResult.rows
        },
        query2_all_usernames: {
          description: 'All available usernames in the profile table',
          count: allUsernamesResult.rows.length,
          results: allUsernamesResult.rows
        },
        query3_user_tenants: {
          description: 'Tenants each user belongs to',
          count: userTenantsResult.rows.length,
          results: userTenantsResult.rows
        }
      };
    }, event);

    console.log('✅ Database queries completed successfully');
    console.log(`Found ${result.query1_saifer_users.count} users with "saifer" in username`);
    console.log(`Found ${result.query2_all_usernames.count} total users with usernames`);
    console.log(`Found ${result.query3_user_tenants.count} user-tenant relationships`);

    return {
      success: true,
      message: 'Database queries executed successfully',
      data: result
    };

  } catch (error) {
    console.error('❌ Failed to execute database queries:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to execute database queries: ${error.message}`
    });
  }
});