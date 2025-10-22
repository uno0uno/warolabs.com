import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient.js';

export default defineEventHandler(async (event) => {
  try {
    console.log('🏗️ Setting up site branding configuration...');

    const result = await withPostgresClient(async (client) => {
      // Step 1: Add brand_name column to tenant_sites
      console.log('📊 Adding brand_name column to tenant_sites...');
      await client.query(`
        ALTER TABLE tenant_sites 
        ADD COLUMN IF NOT EXISTS brand_name TEXT
      `);

      // Step 2: Update existing sites with brand names
      console.log('🏷️ Setting brand names for existing sites...');
      await client.query(`
        UPDATE tenant_sites 
        SET brand_name = CASE 
          WHEN site = 'warolabs.com' THEN 'Warolabs'
          WHEN site = 'warocol.com' THEN 'Waro Colombia'
          ELSE brand_name
        END,
        updated_at = NOW()
        WHERE brand_name IS NULL
      `);

      // Step 3: Create separate tenant for Waro Colombia
      console.log('🏢 Creating Waro Colombia tenant...');
      
      // Check if tenant already exists
      const existingTenant = await client.query(`
        SELECT id FROM tenants WHERE slug = 'warocolombia'
      `);

      let waroColombiaId;
      
      if (existingTenant.rows.length === 0) {
        const newTenant = await client.query(`
          INSERT INTO tenants (id, name, slug, created_at)
          VALUES (gen_random_uuid(), 'Waro Colombia', 'warocolombia', NOW())
          RETURNING id
        `);
        waroColombiaId = newTenant.rows[0].id;
        console.log(`✅ Created Waro Colombia tenant with ID: ${waroColombiaId}`);
      } else {
        waroColombiaId = existingTenant.rows[0].id;
        console.log(`📋 Using existing Waro Colombia tenant: ${waroColombiaId}`);
      }

      // Step 4: Move warocol.com to the new tenant
      console.log('🔄 Moving warocol.com to Waro Colombia tenant...');
      await client.query(`
        UPDATE tenant_sites 
        SET tenant_id = $1, updated_at = NOW()
        WHERE site = 'warocol.com'
      `, [waroColombiaId]);

      // Step 5: Get updated configuration
      const sitesResult = await client.query(`
        SELECT 
          ts.*,
          t.name as tenant_name,
          t.slug as tenant_slug
        FROM tenant_sites ts
        JOIN tenants t ON ts.tenant_id = t.id
        WHERE ts.is_active = true
        ORDER BY ts.site
      `);

      const tenantsResult = await client.query(`
        SELECT * FROM tenants ORDER BY name
      `);

      return {
        sites_configured: sitesResult.rows,
        tenants: tenantsResult.rows
      };
    }, event);

    console.log('✅ Site branding configuration complete');

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('❌ Failed to setup site branding:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to setup site branding: ${error.message}`,
      data: error.data || {}
    });
  }
});