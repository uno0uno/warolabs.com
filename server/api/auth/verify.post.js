import { createError, getHeader } from 'h3';
import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { token, email } = body;
    
    if (!token || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token and email are required'
      });
    }
    
    console.log(`🔍 Verifying magic link - Email: ${email}, Token: ${token.substring(0, 8)}...`);
    
    const result = await withPostgresClient(async (client) => {
      // Find valid unused magic token (with analytics support)
      const tokenQuery = `
        SELECT mt.*, p.id as user_id, p.email, p.name
        FROM magic_tokens mt
        JOIN profile p ON mt.user_id = p.id
        WHERE mt.token = $1 
          AND p.email = $2 
          AND mt.expires_at > NOW()
          AND mt.used = false
        LIMIT 1
      `;
      const tokenResult = await client.query(tokenQuery, [token, email]);
      
      if (tokenResult.rows.length === 0) {
        console.log(`❌ Invalid or expired token for email: ${email}`);
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid or expired magic link'
        });
      }
      
      const user = tokenResult.rows[0];
      console.log(`✅ Valid token found for user: ${user.user_id}`);
      
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
      
      // Mark magic token as used (preserves for analytics)
      await client.query(
        'UPDATE magic_tokens SET used = true, used_at = NOW() WHERE token = $1', 
        [token]
      );
      console.log(`✅ Magic token marked as used`);
      
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
        VALUES ($1, $2, $3, NOW(), NOW(), $4, $5, 'magic_link', true)
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
        }
      };
    }, event);
    
    // Set session cookie
    setCookie(event, 'session-token', result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });
    
    return {
      success: true,
      message: "Login successful",
      user: result.user
    };
  } catch (error) {
    console.error('❌ Magic link verification error:', error);
    throw error;
  }
});