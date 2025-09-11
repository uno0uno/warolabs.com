import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  try {
    const result = await withPostgresClient(async (client) => {
      // Check templates table structure
      const templatesQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'templates' AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      const templates = await client.query(templatesQuery);
      
      // Check template_versions table structure  
      const versionsQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'template_versions' AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      const versions = await client.query(versionsQuery);

      return {
        templates: templates.rows,
        template_versions: versions.rows
      };
    });

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('Error checking templates structure:', error);
    
    return {
      success: false,
      message: error.message,
      data: {}
    };
  }
});