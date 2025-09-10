import { createError } from 'h3';
import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  try {
    const sessionToken = getCookie(event, 'session-token');
    
    if (!sessionToken) {
      console.log(`⚠️ No session to sign out`);
      return {
        success: true,
        message: "Already signed out"
      };
    }
    
    console.log(`🚪 Signing out session: ${sessionToken.substring(0, 8)}...`);
    
    await withPostgresClient(async (client) => {
      // Mark session as ended for analytics (don't delete)
      await client.query(
        'UPDATE sessions SET is_active = false, ended_at = NOW(), end_reason = $1 WHERE id = $2',
        ['logout', sessionToken]
      );
      console.log(`📊 Session marked as ended with logout reason for analytics`);
    }, event);
    
    // Clear session cookie
    deleteCookie(event, 'session-token');
    console.log(`🍪 Session cookie cleared`);
    
    return {
      success: true,
      message: "Signed out successfully"
    };
  } catch (error) {
    console.error('❌ Signout error:', error);
    throw error;
  }
});