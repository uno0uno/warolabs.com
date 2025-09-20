import { createError } from 'h3';
import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';
import crypto from 'crypto';

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
      
      // Check if user has an associated tenant
      const tenantQuery = `
        SELECT tm.tenant_id, tm.role, t.name as tenant_name
        FROM tenant_members tm
        JOIN tenants t ON tm.tenant_id = t.id
        WHERE tm.user_id = $1
        LIMIT 1
      `;
      const tenantResult = await client.query(tenantQuery, [user.user_id]);
      
      if (tenantResult.rows.length === 0) {
        console.log(`❌ User ${user.user_id} has no tenant association - access denied`);
        throw createError({
          statusCode: 403,
          statusMessage: 'Access denied: No tenant association found. Please contact your administrator.'
        });
      }
      
      const tenantInfo = tenantResult.rows[0];
      console.log(`✅ User ${user.user_id} has tenant: ${tenantInfo.tenant_name} (${tenantInfo.role})`);
      
      // Mark token as used
      await client.query(
        'UPDATE magic_tokens SET used = true, used_at = NOW() WHERE verification_code = $1 AND user_id = $2',
        [code, user.user_id]
      );
      console.log(`✅ Verification code marked as used`);
      
      // Create session with analytics tracking
      const sessionId = crypto.randomBytes(16).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      // Get client info for analytics
      const forwardedFor = getHeader(event, 'x-forwarded-for');
      const clientIP = forwardedFor ? forwardedFor.split(',')[0].trim() : event.node.req.socket.remoteAddress || null;
      const userAgent = getHeader(event, 'user-agent') || null;
      
      const sessionQuery = `
        INSERT INTO sessions (
          id, user_id, expires_at, 
          created_at, last_activity_at, 
          ip_address, user_agent, login_method, is_active
        )
        VALUES ($1, $2, $3, NOW(), NOW(), $4, $5, 'verification_code', true)
        RETURNING id
      `;
      const sessionResult = await client.query(sessionQuery, [
        sessionId, user.user_id, expiresAt, clientIP, userAgent
      ]);
      console.log(`🎫 Session created with ID: ${sessionResult.rows[0].id}, IP: ${clientIP}`);
      
      return {
        sessionToken: sessionId,
        user: {
          id: user.user_id,
          email: user.email,
          name: user.name
        },
        tenant: {
          id: tenantInfo.tenant_id,
          name: tenantInfo.tenant_name,
          role: tenantInfo.role
        }
      };
    });
    
    // Set session cookie
    setCookie(event, 'session-token', result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days to match session expiry
      path: '/'
    });
    
    console.log(`✅ Verification code login successful for: ${result.user.email}`);
    
    return {
      success: true,
      message: "Verification successful",
      user: result.user,
      tenant: result.tenant
    };
    
  } catch (error) {
    console.error('❌ Verification code handler error:', error);
    throw error;
  }
});