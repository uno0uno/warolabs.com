import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  return await withPostgresClient(async (client) => {
    try {
      // Begin transaction for data migration
      await client.query('BEGIN');

      // Migrate existing leads to lead_interactions
      const migrateQuery = `
        INSERT INTO lead_interactions (
          lead_id,
          interaction_type,
          source,
          medium,
          campaign,
          term,
          content,
          referrer_url,
          ip_address,
          user_agent,
          created_at,
          metadata
        )
        SELECT 
          l.id as lead_id,
          'lead_capture' as interaction_type,
          l.source,
          l.medium,
          l.campaign,
          l.term,
          l.content,
          l.referrer_url,
          l.ip_address::inet,
          l.user_agent,
          l.created_at,
          jsonb_build_object(
            'original_lead_data', true,
            'migrated_at', NOW(),
            'profile_id', l.profile_id,
            'is_verified', l.is_verified,
            'converted_at', l.converted_at
          ) as metadata
        FROM leads l
        WHERE NOT EXISTS (
          SELECT 1 FROM lead_interactions li 
          WHERE li.lead_id = l.id AND li.interaction_type = 'lead_capture'
        )
      `;

      const result = await client.query(migrateQuery);
      
      // Get count of migrated records
      const countQuery = `
        SELECT COUNT(*) as migrated_count
        FROM lead_interactions 
        WHERE metadata->>'original_lead_data' = 'true'
      `;
      
      const countResult = await client.query(countQuery);
      const migratedCount = countResult.rows[0].migrated_count;

      // Also create interactions for existing email opens if they exist
      const emailOpensQuery = `
        INSERT INTO lead_interactions (
          lead_id,
          interaction_type,
          source,
          medium,
          campaign,
          created_at,
          ip_address,
          user_agent,
          metadata
        )
        SELECT 
          eo.lead_id,
          'email_open' as interaction_type,
          'email_campaign' as source,
          'email' as medium,
          c.name as campaign,
          eo.opened_at as created_at,
          eo.ip_address::inet,
          eo.user_agent,
          jsonb_build_object(
            'original_email_open', true,
            'migrated_at', NOW(),
            'email_open_id', eo.id,
            'campaign_id', eo.campaign_id
          ) as metadata
        FROM email_opens eo
        JOIN campaign c ON eo.campaign_id = c.id
        WHERE NOT EXISTS (
          SELECT 1 FROM lead_interactions li 
          WHERE li.lead_id = eo.lead_id 
          AND li.interaction_type = 'email_open'
          AND li.metadata->>'email_open_id' = eo.id::text
        )
      `;

      const emailOpensResult = await client.query(emailOpensQuery);

      // Create interactions for existing email clicks if they exist
      const emailClicksQuery = `
        INSERT INTO lead_interactions (
          lead_id,
          interaction_type,
          source,
          medium,
          campaign,
          created_at,
          ip_address,
          user_agent,
          metadata
        )
        SELECT 
          ec.lead_id,
          'email_click' as interaction_type,
          'email_campaign' as source,
          'email' as medium,
          c.name as campaign,
          ec.clicked_at as created_at,
          ec.ip_address::inet,
          ec.user_agent,
          jsonb_build_object(
            'original_email_click', true,
            'migrated_at', NOW(),
            'email_click_id', ec.id,
            'campaign_id', ec.campaign_id,
            'original_url', ec.original_url
          ) as metadata
        FROM email_clicks ec
        JOIN campaign c ON ec.campaign_id = c.id
        WHERE NOT EXISTS (
          SELECT 1 FROM lead_interactions li 
          WHERE li.lead_id = ec.lead_id 
          AND li.interaction_type = 'email_click'
          AND li.metadata->>'email_click_id' = ec.id::text
        )
      `;

      const emailClicksResult = await client.query(emailClicksQuery);

      // Commit transaction
      await client.query('COMMIT');

      return {
        success: true,
        message: 'Lead data migration completed successfully',
        details: {
          leads_migrated: result.rowCount,
          total_interactions: migratedCount,
          email_opens_migrated: emailOpensResult.rowCount,
          email_clicks_migrated: emailClicksResult.rowCount
        }
      };

    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      console.error('Error migrating lead data:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }, event);
});