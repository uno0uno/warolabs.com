import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient.js';

export default defineEventHandler(async (event) => {
  try {
    console.log('🔍 Analyzing database structure and data...');

    const result = await withPostgresClient(async (client) => {
      // Query 1: Get table structure information
      console.log('Query 1: Getting table structure...');
      const tablesResult = await client.query(`
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
      `);

      // Query 2: Get foreign key relationships
      console.log('Query 2: Getting foreign key relationships...');
      const fkResult = await client.query(`
        SELECT 
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        ORDER BY tc.table_name
      `);

      // Query 3: Get sample data from main tables
      console.log('Query 3: Getting sample data from profile table...');
      const profileResult = await client.query(`
        SELECT 
          id,
          name,
          email,
          user_name,
          role,
          created_at,
          updated_at
        FROM profile 
        ORDER BY created_at DESC
        LIMIT 10
      `);

      // Query 4: Get cluster/events data
      console.log('Query 4: Getting events/clusters data...');
      const clustersResult = await client.query(`
        SELECT 
          c.id,
          c.cluster_name,
          c.description,
          c.start_date,
          c.end_date,
          c.cluster_type,
          c.is_active,
          p.name as creator_name,
          p.email as creator_email
        FROM clusters c
        LEFT JOIN profile p ON c.profile_id = p.id
        ORDER BY c.created_at DESC
        LIMIT 10
      `);

      // Query 5: Get tenant information
      console.log('Query 5: Getting tenant information...');
      const tenantsResult = await client.query(`
        SELECT 
          t.id,
          t.name,
          t.slug,
          t.created_at,
          COUNT(tm.user_id) as member_count
        FROM tenants t
        LEFT JOIN tenant_members tm ON t.id = tm.tenant_id AND tm.is_active = true
        GROUP BY t.id, t.name, t.slug, t.created_at
        ORDER BY t.created_at DESC
      `);

      // Query 6: Get table row counts
      console.log('Query 6: Getting table row counts...');
      const tableCountsResult = await client.query(`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as total_inserts,
          n_tup_upd as total_updates,
          n_tup_del as total_deletes,
          n_live_tup as current_rows,
          n_dead_tup as dead_rows
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
        ORDER BY n_live_tup DESC
      `);

      return {
        database_structure: {
          description: 'Table structure and columns',
          tables: tablesResult.rows
        },
        foreign_keys: {
          description: 'Foreign key relationships between tables',
          relationships: fkResult.rows
        },
        sample_profiles: {
          description: 'Sample user profiles data',
          count: profileResult.rows.length,
          data: profileResult.rows
        },
        sample_clusters: {
          description: 'Sample events/clusters data',
          count: clustersResult.rows.length,
          data: clustersResult.rows
        },
        tenants_info: {
          description: 'Tenant organizations and member counts',
          count: tenantsResult.rows.length,
          data: tenantsResult.rows
        },
        table_statistics: {
          description: 'Table row counts and activity statistics',
          data: tableCountsResult.rows
        }
      };
    }, event);

    console.log('✅ Database analysis completed successfully');

    return {
      success: true,
      message: 'Database analysis completed',
      analysis: result
    };

  } catch (error) {
    console.error('❌ Failed to analyze database:', error);
    
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
});