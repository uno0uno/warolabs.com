import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient.js';

export default defineEventHandler(async (event) => {
  try {
    console.log('🔧 Adding tenant_id to sessions table...');

    const result = await withPostgresClient(async (client) => {
      // Add tenant_id column to sessions table
      await client.query(`
        ALTER TABLE sessions 
        ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id)
      `);
      
      console.log('✅ Added tenant_id column to sessions table');

      // Check current sessions structure
      const sessionsStructure = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'sessions' 
        ORDER BY ordinal_position
      `);

      // Get any existing sessions to see what needs to be updated
      const existingSessions = await client.query(`
        SELECT id, user_id, created_at, tenant_id
        FROM sessions 
        WHERE is_active = true
        ORDER BY created_at DESC
        LIMIT 10
      `);

      return {
        sessions_structure: sessionsStructure.rows,
        existing_sessions: existingSessions.rows
      };
    }, event);

    console.log('✅ Sessions table modification complete');

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('❌ Failed to modify sessions table:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to modify sessions: ${error.message}`,
      data: error.data || {}
    });
  }
});