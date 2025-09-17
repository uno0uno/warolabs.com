import { defineEventHandler, readBody } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
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
    const result = await withPostgresClient(async (client) => {
      console.log('📤 [API] Executing create_template_pair function...');
      
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

      console.log('📥 [API] Function result:', queryResult.rows[0]);
      return queryResult.rows[0];
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