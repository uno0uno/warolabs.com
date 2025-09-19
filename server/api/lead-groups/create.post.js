import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;
  console.log(`🔐 Creando lead group para tenant: ${tenantContext.tenant_name}`);

  const body = await readBody(event);
  const {
    group_name,
    group_description,
    source_type = 'all',
    source_group_id,
    filters = {}
  } = body;

  if (!group_name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Group name is required'
    });
  }

  if (source_type === 'existing_group' && !source_group_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Source group ID is required when creating from existing group'
    });
  }

  return await withPostgresClient(async (client) => {
    try {
      await client.query('BEGIN');

      // First create the lead group record with tenant association
      const createGroupQuery = `
        INSERT INTO lead_groups (
          name,
          description,
          filters,
          created_by_profile_id,
          created_at
        )
        VALUES ($1, $2, $3::jsonb, $4, NOW())
        RETURNING id, created_at
      `;

      const groupResult = await client.query(createGroupQuery, [
        group_name,
        group_description || null,
        JSON.stringify(filters),
        tenantContext.user_id
      ]);

      const groupId = groupResult.rows[0].id;

      // Insert leads into lead_group_members based on source type
      let membersResult;

      if (source_type === 'existing_group') {
        // Copy leads from existing group
        const copyMembersQuery = `
          INSERT INTO lead_group_members (group_id, lead_id, added_at)
          SELECT $1, lead_id, NOW()
          FROM lead_group_members
          WHERE group_id = $2
        `;
        
        membersResult = await client.query(copyMembersQuery, [groupId, source_group_id]);
      } else {
        // Create from all leads with filters
        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 1;

        // Build WHERE clause based on filters
        if (filters.min_interactions > 0) {
          whereConditions.push(`interaction_count >= $${paramIndex}`);
          queryParams.push(filters.min_interactions);
          paramIndex++;
        }

        if (filters.min_opens > 0) {
          whereConditions.push(`email_open_count >= $${paramIndex}`);
          queryParams.push(filters.min_opens);
          paramIndex++;
        }

        if (filters.min_clicks > 0) {
          whereConditions.push(`email_click_count >= $${paramIndex}`);
          queryParams.push(filters.min_clicks);
          paramIndex++;
        }

        if (filters.source) {
          whereConditions.push(`$${paramIndex} = ANY(sources)`);
          queryParams.push(filters.source);
          paramIndex++;
        }

        if (filters.medium) {
          whereConditions.push(`$${paramIndex} = ANY(mediums)`);
          queryParams.push(filters.medium);
          paramIndex++;
        }

        if (filters.campaigns && filters.campaigns.length > 0) {
          const campaignPlaceholders = filters.campaigns.map(() => `$${paramIndex++}`).join(',');
          whereConditions.push(`campaign_slugs && ARRAY[${campaignPlaceholders}]::text[]`);
          queryParams.push(...filters.campaigns);
        }

        if (filters.is_verified !== undefined) {
          whereConditions.push(`is_verified = $${paramIndex}`);
          queryParams.push(filters.is_verified);
          paramIndex++;
        }

        if (filters.is_converted !== undefined) {
          if (filters.is_converted) {
            whereConditions.push(`converted_at IS NOT NULL`);
          } else {
            whereConditions.push(`converted_at IS NULL`);
          }
        }

        // Filter by specific interaction type (leads that have this type)
        if (filters.has_interaction_type) {
          whereConditions.push(`$${paramIndex} = ANY(interaction_types)`);
          queryParams.push(filters.has_interaction_type);
          paramIndex++;
        }

        // Filter by interaction type exclusion (leads that DON'T have this type)
        if (filters.exclude_interaction_type) {
          whereConditions.push(`NOT ($${paramIndex} = ANY(interaction_types))`);
          queryParams.push(filters.exclude_interaction_type);
          paramIndex++;
        }

        // Filter by leads with ONLY specific interaction type
        if (filters.only_interaction_type) {
          whereConditions.push(`array_length(interaction_types, 1) = 1 AND $${paramIndex} = ANY(interaction_types)`);
          queryParams.push(filters.only_interaction_type);
          paramIndex++;
        }

        // Filter by recent interactions (interactions in last X days)
        if (filters.recent_interaction_days && filters.recent_interaction_days > 0) {
          whereConditions.push(`last_interaction_date >= NOW() - INTERVAL '${filters.recent_interaction_days} days'`);
        }

        // Filter by interaction count range
        if (filters.min_total_interactions !== undefined && filters.min_total_interactions > 0) {
          whereConditions.push(`interaction_count >= $${paramIndex}`);
          queryParams.push(filters.min_total_interactions);
          paramIndex++;
        }

        if (filters.max_total_interactions !== undefined && filters.max_total_interactions > 0) {
          whereConditions.push(`interaction_count <= $${paramIndex}`);
          queryParams.push(filters.max_total_interactions);
          paramIndex++;
        }

        // Handle specific emails filter
        if (filters.specific_emails && filters.specific_emails.length > 0) {
          const emailPlaceholders = filters.specific_emails.map(() => `$${paramIndex++}`).join(',');
          whereConditions.push(`email IN (${emailPlaceholders})`);
          queryParams.push(...filters.specific_emails);
        }

        const whereClause = whereConditions.length > 0 
          ? `WHERE ${whereConditions.join(' AND ')}` 
          : '';

        // If campaigns are specified, use a simpler approach to get ALL leads from those campaigns
        let addMembersQuery;
        if (filters.campaigns && filters.campaigns.length > 0) {
          // Simple approach: get all leads from specified campaigns
          const campaignPlaceholders = filters.campaigns.map((_, index) => `$${index + 1}`).join(',');
          addMembersQuery = `
            INSERT INTO lead_group_members (group_id, lead_id, added_at)
            SELECT DISTINCT $${filters.campaigns.length + 1}::uuid, l.id, NOW()
            FROM leads l
            JOIN campaign_leads cl ON l.id = cl.lead_id
            JOIN campaign c ON cl.campaign_id = c.id
            WHERE c.slug IN (${campaignPlaceholders})
          `;
          queryParams = [...filters.campaigns, groupId];
        } else {
          // Complex filtering approach for other criteria
          addMembersQuery = `
            INSERT INTO lead_group_members (group_id, lead_id, added_at)
            WITH lead_metrics AS (
              SELECT 
                l.id as lead_id,
                l.is_verified,
                l.converted_at,
                p.email,
                COUNT(DISTINCT li.id) as interaction_count,
                COUNT(DISTINCT CASE WHEN li.interaction_type = 'email_open' THEN li.id END) as email_open_count,
                COUNT(DISTINCT CASE WHEN li.interaction_type = 'email_click' THEN li.id END) as email_click_count,
                ARRAY_AGG(DISTINCT li.source) FILTER (WHERE li.source IS NOT NULL) as sources,
                ARRAY_AGG(DISTINCT li.medium) FILTER (WHERE li.medium IS NOT NULL) as mediums,
                ARRAY_AGG(DISTINCT li.campaign) FILTER (WHERE li.campaign IS NOT NULL) as campaigns,
                ARRAY_AGG(DISTINCT c.slug) FILTER (WHERE c.slug IS NOT NULL) as campaign_slugs,
                ARRAY_AGG(DISTINCT c.id::text) FILTER (WHERE c.id IS NOT NULL) as campaign_ids,
                ARRAY_AGG(DISTINCT li.interaction_type) FILTER (WHERE li.interaction_type IS NOT NULL) as interaction_types,
                MAX(li.created_at) as last_interaction_date
              FROM leads l
              JOIN profile p ON l.profile_id = p.id
              LEFT JOIN lead_interactions li ON l.id = li.lead_id
              LEFT JOIN campaign_leads cl ON l.id = cl.lead_id
              LEFT JOIN campaign c ON cl.campaign_id = c.id
              GROUP BY l.id, l.is_verified, l.converted_at, p.email
            )
            SELECT $${paramIndex}::uuid, lead_id, NOW()
            FROM lead_metrics
            ${whereClause}
          `;
          queryParams.push(groupId);
        }

        membersResult = await client.query(addMembersQuery, queryParams);
      }

      await client.query('COMMIT');

      return {
        success: true,
        message: 'Lead group created successfully',
        data: {
          group_id: groupId,
          group_name: group_name,
          members_added: membersResult.rowCount,
          created_at: groupResult.rows[0].created_at
        }
      };

    } catch (error) {
      await client.query('ROLLBACK');
      
      // Check if it's a table not found error
      if (error.message?.includes('relation "lead_groups" does not exist')) {
        // Create the tables if they don't exist
        try {
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

          // Tables created, return success message
          return {
            success: true,
            message: 'Lead groups tables created successfully. Please retry creating the group.',
            data: null
          };
        } catch (createError) {
          console.error('Error creating lead groups tables:', createError);
          throw createError;
        }
      }
      
      console.error('Error creating lead group:', error);
      throw error;
    }
  }, event);
});