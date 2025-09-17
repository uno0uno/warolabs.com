import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  return await withPostgresClient(async (client) => {
    try {
      // Create lead_interactions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS lead_interactions (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
          interaction_type varchar(50) NOT NULL,
          source varchar(100),
          medium varchar(100),
          campaign varchar(100),
          term varchar(100),
          content varchar(100),
          referrer_url text,
          ip_address inet,
          user_agent text,
          created_at timestamp with time zone DEFAULT now(),
          metadata jsonb DEFAULT '{}'::jsonb
        )
      `);

      // Create indexes for performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead_id 
        ON lead_interactions(lead_id)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_lead_interactions_type 
        ON lead_interactions(interaction_type)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_lead_interactions_created 
        ON lead_interactions(created_at DESC)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_lead_interactions_source 
        ON lead_interactions(source, medium)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead_type_created 
        ON lead_interactions(lead_id, interaction_type, created_at DESC)
      `);

      return {
        success: true,
        message: 'lead_interactions table created successfully with indexes'
      };
    } catch (error) {
      console.error('Error creating lead_interactions table:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }, event);
});