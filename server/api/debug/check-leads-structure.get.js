import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  return await withPostgresClient(async (client) => {
    try {
      // Get leads table structure
      const structureQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'leads' 
        ORDER BY ordinal_position
      `;
      
      const structureResult = await client.query(structureQuery);
      
      // Get a sample lead to see actual data
      const sampleQuery = `SELECT * FROM leads LIMIT 1`;
      const sampleResult = await client.query(sampleQuery);

      return {
        success: true,
        table_structure: structureResult.rows,
        sample_data: sampleResult.rows[0] || null,
        total_leads: await client.query('SELECT COUNT(*) as count FROM leads').then(r => r.rows[0].count)
      };

    } catch (error) {
      console.error('Error checking leads structure:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }, event);
});