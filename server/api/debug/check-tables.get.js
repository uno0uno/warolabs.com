import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  return await withPostgresClient(async (client) => {
    try {
      // Check if campaign_history table exists
      const campaignHistoryCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'campaign_history'
        ) as exists
      `);

      // Check if template_version_history table exists
      const templateHistoryCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'template_version_history'
        ) as exists
      `);

      // Check campaign_leads columns
      const campaignLeadsColumns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'campaign_leads'
        ORDER BY ordinal_position
      `);

      // Check campaign columns
      const campaignColumns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'campaign'
        AND column_name IN ('is_deleted', 'deleted_at', 'deleted_by')
        ORDER BY ordinal_position
      `);

      // Check campaign_template_versions columns
      const ctvColumns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'campaign_template_versions'
        AND column_name IN ('is_active', 'deactivated_at')
        ORDER BY ordinal_position
      `);

      return {
        success: true,
        data: {
          campaign_history_exists: campaignHistoryCheck.rows[0].exists,
          template_version_history_exists: templateHistoryCheck.rows[0].exists,
          campaign_leads_columns: campaignLeadsColumns.rows,
          campaign_soft_delete_columns: campaignColumns.rows,
          campaign_template_versions_columns: ctvColumns.rows
        }
      };
    } catch (error) {
      console.error('Error checking tables:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }, event);
});