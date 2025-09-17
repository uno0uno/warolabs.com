import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  try {
    const result = await withPostgresClient(async (client) => {
      // Primero verificar que los templates existen
      const templatesCheck = await client.query(`
        SELECT id, pair_id, template_name, template_type 
        FROM templates 
        WHERE pair_id = $1 AND is_deleted = false
      `, ['e37af038-1a30-4014-8e70-a05b363dcf4f']);
      
      console.log('Templates found:', templatesCheck.rows);
      
      // Verificar específicamente el template de email
      const emailCheck = await client.query(`
        SELECT id, template_name 
        FROM templates 
        WHERE pair_id = $1 AND template_type = 'email' AND is_deleted = false
      `, ['e37af038-1a30-4014-8e70-a05b363dcf4f']);
      
      console.log('Email template found:', emailCheck.rows);
      
      // Probar la función
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
      
      return {
        templates_check: templatesCheck.rows,
        email_check: emailCheck.rows,
        function_result: functionResult.rows
      };
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Debug test error:', error);
    return { 
      success: false, 
      error: error.message,
      stack: error.stack
    };
  }
});