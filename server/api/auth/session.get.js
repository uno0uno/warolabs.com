import { createError } from 'h3';
import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  try {
    const sessionToken = getCookie(event, 'session-token');
    
    if (!sessionToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No session found'
      });
    }
    
    console.log(`🔍 Checking session: ${sessionToken.substring(0, 8)}...`);
    
    const result = await withPostgresClient(async (client) => {
      // Find valid session
      const sessionQuery = `
        SELECT s.*, p.id as user_id, p.email, p.name, p.created_at as user_created_at
        FROM sessions s
        JOIN profile p ON s.user_id = p.id
        WHERE s.id = $1 
          AND s.expires_at > NOW()
        LIMIT 1
      `;
      const sessionResult = await client.query(sessionQuery, [sessionToken]);
      
      if (sessionResult.rows.length === 0) {
        console.log(`❌ Invalid or expired session`);
        // Clear invalid cookie
        deleteCookie(event, 'session-token');
        throw createError({
          statusCode: 401,
          statusMessage: 'Session expired'
        });
      }
      
      const session = sessionResult.rows[0];
      console.log(`✅ Valid session found for user: ${session.user_id}`);
      
      return {
        user: {
          id: session.user_id,
          email: session.email,
          name: session.name,
          createdAt: session.user_created_at
        },
        session: {
          expiresAt: session.expires_at
        }
      };
    }, event);
    
    return {
      success: true,
      user: result.user,
      session: result.session
    };
  } catch (error) {
    console.error('❌ Session check error:', error);
    throw error;
  }
});