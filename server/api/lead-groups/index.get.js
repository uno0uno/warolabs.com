import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;

  return await withPostgresClient(async (client) => {
    try {
      console.log(`🔐 Consultando lead groups para tenant: ${tenantContext.tenant_name}`);
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
            created_by_profile_id uuid REFERENCES profile(id),
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

      // Get lead groups with tenant isolation
      const baseGroupsQuery = `
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
        JOIN profile p ON lg.created_by_profile_id = p.id
        JOIN tenant_members tm ON p.id = tm.user_id
        LEFT JOIN lead_group_members lgm ON lg.id = lgm.group_id
        LEFT JOIN leads l ON lgm.lead_id = l.id
        GROUP BY lg.id, lg.name, lg.description, lg.filters, lg.created_at, lg.updated_at
        ORDER BY lg.created_at DESC
      `;

      // Apply tenant filter
      const { query: groupsQuery, params: groupsParams } = addTenantFilterSimple(baseGroupsQuery, tenantContext, []);

      const groupsResult = await client.query(groupsQuery, groupsParams);

      // For each group, get recent activity
      const groupsWithActivity = await Promise.all(
        groupsResult.rows.map(async (group) => {
          const activityQuery = `
            SELECT 
              COUNT(DISTINCT CASE 
                WHEN li.interaction_type = 'email_open' 
                THEN li.lead_id 
              END) as total_opens,
              COUNT(DISTINCT CASE 
                WHEN li.interaction_type = 'email_click' 
                THEN li.lead_id 
              END) as total_clicks,
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
            LEFT JOIN lead_interactions li ON lgm.lead_id = li.lead_id
            WHERE lgm.group_id = $1
          `;

          const activityResult = await client.query(activityQuery, [group.id]);
          
          console.log(`📊 Activity stats for group ${group.name}:`, {
            group_id: group.id,
            member_count: group.member_count,
            total_opens: activityResult.rows[0].total_opens,
            total_clicks: activityResult.rows[0].total_clicks,
            recent_opens: activityResult.rows[0].recent_opens,
            recent_clicks: activityResult.rows[0].recent_clicks,
            raw_result: activityResult.rows[0]
          });
          
          // Debug: Ver qué leads están en este grupo
          const debugMembersQuery = `
            SELECT lgm.lead_id, l.profile_id, p.email 
            FROM lead_group_members lgm 
            JOIN leads l ON lgm.lead_id = l.id 
            JOIN profile p ON l.profile_id = p.id 
            WHERE lgm.group_id = $1
          `;
          const debugMembersResult = await client.query(debugMembersQuery, [group.id]);
          console.log(`👥 Members in group ${group.name}:`, debugMembersResult.rows);
          
          return {
            ...group,
            activity_stats: {
              total_opens: activityResult.rows[0].total_opens || 0,
              total_clicks: activityResult.rows[0].total_clicks || 0,
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

      console.log(`✅ Encontrados ${groupsResult.rowCount} lead groups para tenant: ${tenantContext.tenant_name}`);
      return {
        success: true,
        data: groupsWithActivity,
        total_groups: groupsResult.rowCount,
        tenant_info: {
          tenant_id: tenantContext.tenant_id,
          tenant_name: tenantContext.tenant_name,
          user_role: tenantContext.role,
          is_superuser: tenantContext.is_superuser
        }
      };

    } catch (error) {
      console.error(`Error fetching lead groups para tenant ${tenantContext.tenant_name}:`, error);
      if (error.statusCode) {
        throw error; // Re-throw known errors
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Error fetching lead groups'
      });
    }
  }, event);
});