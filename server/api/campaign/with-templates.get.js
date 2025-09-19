import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;
  return await withPostgresClient(async (client) => {
    try {
      let query = `
        SELECT 
          c.id,
          c.name,
          t.id as template_id,
          t.template_name,
          t.subject_template,
          t.sender_email,
          tv.id as template_version_id,
          tv.content as template_content,
          tv.version_number
        FROM campaign c
        INNER JOIN campaign_template_versions ctv ON c.id = ctv.campaign_id AND ctv.is_active = true
        INNER JOIN template_versions tv ON ctv.template_version_id = tv.id
        INNER JOIN templates t ON tv.template_id = t.id AND t.active_version_id = tv.id AND t.is_deleted = false
        WHERE (c.is_deleted = false OR c.is_deleted IS NULL)
      `;

      let queryParams = [];
      
      if (!tenantContext.is_superuser) {
        query += ` AND c.profile_id = $1`;
        queryParams.push(tenantContext.user_id);
      }
      
      query += ` ORDER BY c.id DESC, t.id DESC`;

      const result = await client.query(query, queryParams);
      
      // Group by campaign
      const campaignsMap = new Map();
      
      result.rows.forEach(row => {
        if (!campaignsMap.has(row.id)) {
          campaignsMap.set(row.id, {
            id: row.id,
            name: row.name,
            templates: []
          });
        }
        
        if (row.template_id) {
          const campaign = campaignsMap.get(row.id);
          // Only add template if not already present (in case of duplicates)
          const existingTemplate = campaign.templates.find(t => t.id === row.template_id);
          if (!existingTemplate) {
            campaign.templates.push({
              id: row.template_id,
              name: row.template_name,
              subject_template: row.subject_template,
              sender_email: row.sender_email,
              version_id: row.template_version_id,
              content: row.template_content,
              version_number: row.version_number
            });
          }
        }
      });
      
      return {
        success: true,
        data: Array.from(campaignsMap.values())
      };

    } catch (error) {
      console.error('Error fetching campaigns with templates:', error);
      throw error;
    }
  }, event);
});