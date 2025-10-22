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
      // Verify code and get user info with tenant from magic_token
      const verifyQuery = `
        SELECT mt.*, p.email, p.name, p.id as user_id, mt.tenant_id,
               t.name as tenant_name, t.slug as tenant_slug,
               tm.role as user_role
        FROM magic_tokens mt
        JOIN profile p ON mt.user_id = p.id
        LEFT JOIN tenants t ON mt.tenant_id = t.id
        LEFT JOIN tenant_members tm ON tm.user_id = p.id AND tm.tenant_id = mt.tenant_id
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
      
      const tokenData = verifyResult.rows[0];
      console.log(`✅ Valid verification code for user: ${tokenData.user_id}, tenant: ${tokenData.tenant_name}`);
      
      // Verify tenant access using tenant_id from magic_token
      if (!tokenData.tenant_id || !tokenData.tenant_name) {
        console.log(`❌ No tenant context in verification code for user: ${tokenData.user_id}`);
        throw createError({
          statusCode: 403,
          statusMessage: 'Access denied: Invalid tenant context.'
        });
      }
      
      const tenantInfo = {
        tenant_id: tokenData.tenant_id,
        tenant_name: tokenData.tenant_name,
        role: tokenData.user_role || 'member'
      };
      console.log(`✅ User ${tokenData.user_id} has tenant: ${tenantInfo.tenant_name} (${tenantInfo.role})`);
      
      // Mark token as used
      await client.query(
        'UPDATE magic_tokens SET used = true, used_at = NOW() WHERE verification_code = $1 AND user_id = $2',
        [code, tokenData.user_id]
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
          id, user_id, tenant_id, expires_at, 
          created_at, last_activity_at, 
          ip_address, user_agent, login_method, is_active
        )
        VALUES ($1, $2, $3, $4, NOW(), NOW(), $5, $6, 'verification_code', true)
        RETURNING id
      `;
      const sessionResult = await client.query(sessionQuery, [
        sessionId, tokenData.user_id, tenantInfo.tenant_id, expiresAt, clientIP, userAgent
      ]);
      console.log(`🎫 Session created with ID: ${sessionResult.rows[0].id}, Tenant: ${tenantInfo.tenant_name}, IP: ${clientIP}`);
      
      return {
        sessionToken: sessionId,
        user: {
          id: tokenData.user_id,
          email: tokenData.email,
          name: tokenData.name
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