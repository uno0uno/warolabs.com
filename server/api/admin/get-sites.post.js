import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient.js';

export default defineEventHandler(async (event) => {
  try {
    console.log('🌐 Getting all sites configuration...');

    const result = await withPostgresClient(async (client) => {
      // First, check what tables exist
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%site%'
        ORDER BY table_name
      `);

      // Check tenant_sites structure
      const siteStructureResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'tenant_sites' 
        ORDER BY ordinal_position
      `);
      
      // Check tenants structure
      const tenantStructureResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'tenants' 
        ORDER BY ordinal_position
      `);

      // Get all tenant sites with actual column names
      const sitesResult = await client.query(`
        SELECT * FROM tenant_sites 
        ORDER BY site
      `);

      // Get tenants info - check if table exists first
      let tenantsResult = { rows: [] };
      try {
        tenantsResult = await client.query(`
          SELECT id, name, slug FROM tenants 
          ORDER BY name
        `);
      } catch (e) {
        console.log('Tenants table may not exist:', e.message);
      }

      // Get site role mappings - check structure first
      let roleMappingsResult = { rows: [] };
      try {
        roleMappingsResult = await client.query(`
          SELECT 
            srm.*,
            ur.role_name,
            ts.site
          FROM site_role_mappings srm
          JOIN universal_roles ur ON srm.universal_role_id = ur.id
          JOIN tenant_sites ts ON srm.site_id = ts.id
          ORDER BY ts.site, ur.role_name
        `);
      } catch (e) {
        console.log('Role mappings may have different structure:', e.message);
      }

      return {
        tables_found: tablesResult.rows,
        site_structure: siteStructureResult.rows,
        tenant_structure: tenantStructureResult.rows,
        sites: sitesResult.rows,
        tenants: tenantsResult.rows,
        role_mappings: roleMappingsResult.rows
      };
    }, event);

    console.log('✅ Sites configuration retrieved');

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('❌ Failed to get sites:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to get sites: ${error.message}`,
      data: error.data || {}
    });
  }
});