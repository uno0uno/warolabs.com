import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient.js'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔧 Adding tenant_id to magic_tokens table...');
    
    const result = await withPostgresClient(async (client) => {
      // Check if column already exists
      const columnCheckQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'magic_tokens' 
        AND column_name = 'tenant_id'
      `;
      
      const columnExists = await client.query(columnCheckQuery);
      
      if (columnExists.rows.length > 0) {
        console.log('✅ tenant_id column already exists in magic_tokens table');
        return { message: 'Column already exists', success: true };
      }
      
      // Add tenant_id column to magic_tokens table
      await client.query(`
        ALTER TABLE magic_tokens 
        ADD COLUMN tenant_id UUID REFERENCES tenants(id)
      `);
      
      console.log('✅ Added tenant_id column to magic_tokens table');
      
      return { 
        message: 'Successfully added tenant_id column to magic_tokens table',
        success: true 
      };
    }, event);
    
    return result;
    
  } catch (error) {
    console.error('❌ Failed to add tenant_id column:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Database migration failed: ${error.message}`
    });
  }
});