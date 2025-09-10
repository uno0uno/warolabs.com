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
      // Delete session from database
      await client.query('DELETE FROM sessions WHERE id = $1', [sessionToken]);
      console.log(`🗑️ Session deleted from database`);
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