import { createError } from 'h3';
import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, code } = body;
    
    if (!email || !code) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and verification code are required'
      });
    }
    
    console.log(`🔢 Verification code handler - Email: ${email}, Code: ${code}`);
    
    const result = await withPostgresClient(async (client) => {
      // Verify code and get user info
      const verifyQuery = `
        SELECT mt.*, p.email, p.name, p.id as user_id
        FROM magic_tokens mt
        JOIN profile p ON mt.user_id = p.id
        WHERE p.email = $1 AND mt.verification_code = $2 
        AND mt.expires_at > NOW() AND mt.used = false
        LIMIT 1
      `;
      
      const verifyResult = await client.query(verifyQuery, [email, code]);
      
      if (verifyResult.rows.length === 0) {
        console.log(`❌ Invalid or expired verification code for: ${email}`);
        throw createError({
          statusCode: 401,
          statusMessage: 'Código de verificación inválido o expirado'
        });
      }
      
      const user = verifyResult.rows[0];
      console.log(`✅ Valid verification code for user: ${user.user_id}`);
      
      // Mark token as used
      await client.query(
        'UPDATE magic_tokens SET used = true, used_at = NOW() WHERE verification_code = $1 AND user_id = $2',
        [code, user.user_id]
      );
      
      return {
        id: user.user_id,
        email: user.email,
        name: user.name
      };
    });
    
    // Generate JWT session token
    const { jwtSecret } = useRuntimeConfig();
    
    if (!jwtSecret) {
      throw createError({
        statusCode: 500,
        statusMessage: 'JWT secret not configured'
      });
    }
    
    const sessionToken = jwt.sign(
      { 
        userId: result.id, 
        email: result.email, 
        name: result.name 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );
    
    // Set secure cookie
    setCookie(event, 'session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    console.log(`✅ Verification code login successful for: ${result.email}`);
    
    return {
      success: true,
      message: "Verification successful",
      user: result
    };
    
  } catch (error) {
    console.error('❌ Verification code handler error:', error);
    throw error;
  }
});