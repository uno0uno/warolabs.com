import { createError } from 'h3';
import { sendEmail } from '~/server/utils/aws/sesClient';
import { getMagicLinkTemplate } from '~/server/lib/templates/magicLinkTemplate';
import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email } = body;
    
    // Get redirect parameter from query or body
    const query = getQuery(event);
    const redirectParam = query.redirect || body.redirect;
    
    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      });
    }
    
    console.log(`📧 Magic link handler - Email: ${email}`);
    
    const result = await withPostgresClient(async (client) => {
      // Generate secure token and verification code
      const token = crypto.randomBytes(32).toString('hex');
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      // Check if user exists, if not create one
      const userQuery = 'SELECT * FROM profile WHERE email = $1 LIMIT 1';
      const userResult = await client.query(userQuery, [email]);
      
      let userId;
      
      if (userResult.rows.length === 0) {
        console.log(`👤 Creating new user for email: ${email}`);
        const insertUserQuery = `
          INSERT INTO profile (email, name, nationality_id, phone_number) 
          VALUES ($1, $2, $3, $4) 
          RETURNING id
        `;
        const newUserResult = await client.query(insertUserQuery, [
          email, 
          email.split('@')[0], 
          1, // default nationality_id 
          '+1234567890' // default phone_number
        ]);
        userId = newUserResult.rows[0].id;
        console.log(`✅ User created with ID: ${userId}`);
      } else {
        userId = userResult.rows[0].id;
        console.log(`👤 User found with ID: ${userId}`);
      }
      
      // Mark old unused magic tokens as expired for this user (analytics preserved)
      await client.query(
        'UPDATE magic_tokens SET used = true, used_at = NOW() WHERE user_id = $1 AND used = false', 
        [userId]
      );
      
      // Save new magic token to database with analytics fields
      const insertTokenQuery = `
        INSERT INTO magic_tokens (user_id, token, verification_code, expires_at, used, created_at, used_at) 
        VALUES ($1, $2, $3, $4, false, NOW(), NULL)
      `;
      await client.query(insertTokenQuery, [userId, token, verificationCode, expiresAt]);
      console.log(`🔑 Magic token saved for user: ${userId}`);
      
      return { userId, token, verificationCode };
    }, event);
    
    // Generate magic link URL  
    const { public: { baseUrl } } = useRuntimeConfig();
    const cleanBaseUrl = (baseUrl || "http://localhost:4000").replace(/\/$/, '');
    let magicLinkUrl = `${cleanBaseUrl}/auth/verify?token=${result.token}&email=${encodeURIComponent(email)}`;
    
    // Add redirect parameter if provided
    if (redirectParam) {
      magicLinkUrl += `&redirect=${encodeURIComponent(redirectParam)}`;
    }
    
    console.log(`🔗 Magic link URL: ${magicLinkUrl}`);
    
    // Send email
    const html = getMagicLinkTemplate(magicLinkUrl, result.verificationCode);
    await sendEmail({
      fromEmailAddress: "anderson.arevalo@warolabs.com",
      fromName: "Saifer - Warolabs",
      toEmailAddresses: [email],
      subject: "🔑 Tu acceso a Warolabs está listo",
      bodyHtml: html
    });
    console.log(`✅ Magic link sent successfully to: ${email}`);
    
    return {
      success: true,
      message: "Magic link sent successfully"
    };
  } catch (error) {
    console.error('❌ Magic link handler error:', error);
    throw error;
  }
});