import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';

export default defineEventHandler(async (event) => {
  // Authentication is commented out for testing - uncomment when needed
  // try {
  //   await verifyAuthToken(event);
  // } catch (error) {
  //   throw error;
  // }

  return await withPostgresClient(async (client) => {
    try {
      // First check if tables exist
      const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'lead_groups'
        ) as table_exists
      `;
      
      const checkResult = await client.query(checkTableQuery);
      
      if (!checkResult.rows[0].table_exists) {
        // Tables don't exist yet, create them
        await client.query(`
          CREATE TABLE IF NOT EXISTS lead_groups (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name varchar(255) NOT NULL,
            description text,
            filters jsonb DEFAULT '{}'::jsonb,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS lead_group_members (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            group_id uuid NOT NULL REFERENCES lead_groups(id) ON DELETE CASCADE,
            lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
            added_at timestamp with time zone DEFAULT now(),
            UNIQUE(group_id, lead_id)
          )
        `);

        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_lead_group_members_group_id 
          ON lead_group_members(group_id)
        `);

        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_lead_group_members_lead_id 
          ON lead_group_members(lead_id)
        `);

        // Return empty array since tables were just created
        return {
          success: true,
          data: [],
          message: 'Lead groups tables created successfully'
        };
      }

      // Get all lead groups with member counts
      const groupsQuery = `
        SELECT 
          lg.id,
          lg.name,
          lg.description,
          lg.filters,
          lg.created_at,
          lg.updated_at,
          COUNT(DISTINCT lgm.lead_id) as member_count,
          COUNT(DISTINCT CASE WHEN l.converted_at IS NOT NULL THEN lgm.lead_id END) as converted_count,
          COUNT(DISTINCT CASE WHEN l.is_verified = true THEN lgm.lead_id END) as verified_count
        FROM lead_groups lg
        LEFT JOIN lead_group_members lgm ON lg.id = lgm.group_id
        LEFT JOIN leads l ON lgm.lead_id = l.id
        GROUP BY lg.id, lg.name, lg.description, lg.filters, lg.created_at, lg.updated_at
        ORDER BY lg.created_at DESC
      `;

      const groupsResult = await client.query(groupsQuery);

      // For each group, get recent activity
      const groupsWithActivity = await Promise.all(
        groupsResult.rows.map(async (group) => {
          const activityQuery = `
            SELECT 
              COUNT(DISTINCT CASE 
                WHEN li.interaction_type = 'email_open' 
                AND li.created_at >= NOW() - INTERVAL '7 days' 
                THEN li.lead_id 
              END) as recent_opens,
              COUNT(DISTINCT CASE 
                WHEN li.interaction_type = 'email_click' 
                AND li.created_at >= NOW() - INTERVAL '7 days' 
                THEN li.lead_id 
              END) as recent_clicks,
              MAX(li.created_at) as last_activity
            FROM lead_group_members lgm
            JOIN lead_interactions li ON lgm.lead_id = li.lead_id
            WHERE lgm.group_id = $1
          `;

          const activityResult = await client.query(activityQuery, [group.id]);
          
          return {
            ...group,
            recent_activity: {
              recent_opens: activityResult.rows[0].recent_opens || 0,
              recent_clicks: activityResult.rows[0].recent_clicks || 0,
              last_activity: activityResult.rows[0].last_activity
            },
            conversion_rate: group.member_count > 0 
              ? Math.round((group.converted_count / group.member_count) * 100) 
              : 0
          };
        })
      );

      return {
        success: true,
        data: groupsWithActivity,
        total_groups: groupsResult.rowCount
      };

    } catch (error) {
      console.error('Error fetching lead groups:', error);
      throw error;
    }
  }, event);
});