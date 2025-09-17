import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  try {
    const result = await withPostgresClient(async (client) => {
      // Test the function directly
      const functionResult = await client.query(`
        SELECT * FROM update_campaign_templates($1, $2, $3, $4, $5, $6)
      `, [
        'e37af038-1a30-4014-8e70-a05b363dcf4f',
        'test email content', 
        'test landing content',
        'test subject',
        'Test Email Name',
        'Test Landing Name'
      ]);
      
      return functionResult.rows[0];
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Function test error:', error);
    return { 
      success: false, 
      error: error.message,
      stack: error.stack
    };
  }
});