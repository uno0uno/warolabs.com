import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  try {
    const result = await withPostgresClient(async (client) => {
      // Check leads table structure
      const leadsQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'leads' AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      const leads = await client.query(leadsQuery);
      
      // Get sample data
      const sampleQuery = `
        SELECT * FROM leads LIMIT 3
      `;
      
      const sample = await client.query(sampleQuery);

      return {
        columns: leads.rows,
        sample: sample.rows
      };
    });

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('Error checking leads structure:', error);
    
    return {
      success: false,
      message: error.message,
      data: {}
    };
  }
});