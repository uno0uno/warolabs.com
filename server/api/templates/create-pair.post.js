import { defineEventHandler, readBody } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation } from '../../utils/security/tenantIsolation';
import crypto from 'crypto';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;
  try {
    console.log('🎯 [API] Received request to create template pair');
    const body = await readBody(event);
    console.log('📋 [API] Request body:', body);
    
    const {
      template_name,
      description,
      sender_email,
      subject_template,
      email_content,
      landing_title,
      landing_description,
      landing_image_url
    } = body;

    console.log('🔍 [API] Extracted parameters:', {
      template_name,
      description,
      sender_email,
      subject_template,
      email_content: email_content ? `${email_content.substring(0, 50)}...` : 'empty',
      landing_title,
      landing_description: landing_description ? `${landing_description.substring(0, 50)}...` : 'empty',
      landing_image_url
    });

    console.log('🔗 [API] Connecting to database...');
    console.log(`👤 [API] Creating templates for profile: ${tenantContext.user_id} (${tenantContext.tenant_name})`);
    
    const result = await withPostgresClient(async (client) => {
      console.log('📤 [API] Executing create_template_pair function...');
      
      // Verificar si la función acepta profile_id como parámetro
      // Por ahora, vamos a usar la función existente y luego actualizar los templates
      const query = `
        SELECT * FROM create_template_pair($1, $2, $3, $4, $5, $6, $7, $8);
      `;

      const queryResult = await client.query(query, [
        template_name,
        description,
        sender_email,
        subject_template,
        email_content,
        landing_title,
        landing_description,
        landing_image_url
      ]);
      
      // Actualizar los templates creados con el ownership correcto
      const functionResult = queryResult.rows[0].create_template_pair;
      if (functionResult && functionResult.success) {
        if (functionResult.email_template_id) {
          await client.query(`
            UPDATE templates 
            SET created_by_profile_id = $1 
            WHERE id = $2
          `, [tenantContext.user_id, functionResult.email_template_id]);
          
          console.log(`✅ Email template ${functionResult.email_template_id} asignado a profile ${tenantContext.user_id}`);
        }
        
        if (functionResult.landing_template_id) {
          await client.query(`
            UPDATE templates 
            SET created_by_profile_id = $1 
            WHERE id = $2
          `, [tenantContext.user_id, functionResult.landing_template_id]);
          
          console.log(`✅ Landing template ${functionResult.landing_template_id} asignado a profile ${tenantContext.user_id}`);
        }
      }
      
      return functionResult;
    });

    console.log('✅ [API] Database operation successful');
    console.log('📋 [API] Final result:', result);

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('❌ [API] Error creating template pair:', error);
    console.error('🔍 [API] Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return {
      success: false,
      message: 'Error al crear los templates',
      error: error.message
    };
  }
});