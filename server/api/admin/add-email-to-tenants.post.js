import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient.js';

export default defineEventHandler(async (event) => {
  try {
    console.log('📧 Adding email column to tenants table...');

    const result = await withPostgresClient(async (client) => {
      // Add email column to tenants table
      await client.query(`
        ALTER TABLE tenants 
        ADD COLUMN IF NOT EXISTS email VARCHAR(255)
      `);
      
      console.log('✅ Added email column to tenants table');

      // Update existing tenants with their email addresses
      await client.query(`
        UPDATE tenants 
        SET email = CASE 
          WHEN slug = 'warolabs' THEN 'anderson.arevalo@warolabs.com'
          WHEN slug = 'warocolombia' THEN 'anderson.arevalo@warolabs.com'
          ELSE email
        END
        WHERE email IS NULL
      `);

      console.log('✅ Updated existing tenants with email addresses');

      // Get updated tenants
      const tenantsResult = await client.query(`
        SELECT id, name, slug, email, created_at
        FROM tenants 
        ORDER BY name
      `);

      return {
        tenants: tenantsResult.rows
      };
    }, event);

    console.log('✅ Tenant email configuration complete');

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('❌ Failed to add email to tenants:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to add email to tenants: ${error.message}`,
      data: error.data || {}
    });
  }
});