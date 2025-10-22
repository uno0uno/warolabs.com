import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient.js';

export default defineEventHandler(async (event) => {
  try {
    console.log('📧 Updating Waro Colombia tenant email...');

    const result = await withPostgresClient(async (client) => {
      // Update Waro Colombia tenant email
      const updateQuery = `
        UPDATE tenants 
        SET email = $1 
        WHERE slug = $2
        RETURNING id, name, slug, email
      `;
      
      const updateResult = await client.query(updateQuery, [
        'anderson.arevalo@warocol.com', 
        'warocolombia'
      ]);

      if (updateResult.rows.length === 0) {
        throw new Error('Waro Colombia tenant not found');
      }

      console.log('✅ Updated Waro Colombia tenant email to anderson.arevalo@warocol.com');

      // Get all updated tenants
      const tenantsResult = await client.query(`
        SELECT id, name, slug, email, created_at
        FROM tenants 
        ORDER BY name
      `);

      return {
        updatedTenant: updateResult.rows[0],
        allTenants: tenantsResult.rows
      };
    }, event);

    console.log('✅ Waro Colombia email update completed');

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('❌ Failed to update Waro Colombia email:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to update email: ${error.message}`,
      data: error.data || {}
    });
  }
});