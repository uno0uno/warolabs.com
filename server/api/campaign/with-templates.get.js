import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  return await withPostgresClient(async (client) => {
    try {
      const query = `
        SELECT 
          c.id,
          c.name,
          t.id as template_id,
          t.template_name,
          tv.id as template_version_id,
          tv.content as template_content,
          tv.version_number
        FROM campaign c
        INNER JOIN campaign_template_versions ctv ON c.id = ctv.campaign_id
        INNER JOIN template_versions tv ON ctv.template_version_id = tv.id
        INNER JOIN templates t ON tv.template_id = t.id AND t.active_version_id = tv.id
        WHERE t.template_type = 'massive_email'
        ORDER BY c.id DESC, t.id DESC;
      `;

      const result = await client.query(query);
      
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