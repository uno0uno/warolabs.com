import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  try {
    const result = await withPostgresClient(async (client) => {
      // Check if tables exist
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('campaign', 'templates', 'leads', 'email_sends')
        ORDER BY table_name
      `;
      
      const tables = await client.query(tablesQuery);
      
      // Check campaign table structure if exists
      let campaignColumns = [];
      if (tables.rows.some(row => row.table_name === 'campaign')) {
        const columnsQuery = `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'campaign' AND table_schema = 'public'
          ORDER BY ordinal_position
        `;
        const columns = await client.query(columnsQuery);
        campaignColumns = columns.rows;
      }

      return {
        tables: tables.rows,
        campaignColumns: campaignColumns
      };
    });

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('Error checking tables:', error);
    
    return {
      success: false,
      message: error.message,
      data: {}
    };
  }
});