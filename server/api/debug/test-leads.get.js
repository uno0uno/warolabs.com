import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  try {
    const result = await withPostgresClient(async (client) => {
      // Test basic queries step by step
      
      // 1. Count leads
      const countLeads = await client.query('SELECT COUNT(*) as total FROM leads');
      
      // 2. Count profiles  
      const countProfiles = await client.query('SELECT COUNT(*) as total FROM profile');
      
      // 3. Try basic JOIN
      const joinQuery = `
        SELECT l.id, p.email, p.name 
        FROM leads l 
        JOIN profile p ON l.profile_id = p.id 
        LIMIT 5
      `;
      
      const joinResult = await client.query(joinQuery);

      return {
        totalLeads: countLeads.rows[0].total,
        totalProfiles: countProfiles.rows[0].total,
        sampleJoin: joinResult.rows
      };
    });

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('Error in test leads:', error);
    
    return {
      success: false,
      message: error.message,
      error: error.stack
    };
  }
});