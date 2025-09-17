import { defineEventHandler } from 'h3'
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient'

export default defineEventHandler(async (event) => {
  return await withPostgresClient(async (client) => {
    try {
      // Verificar campañas en leads
      const leadsQuery = `
        SELECT DISTINCT campaign, COUNT(*) as lead_count
        FROM leads 
        WHERE campaign IS NOT NULL
        GROUP BY campaign
        ORDER BY lead_count DESC
      `
      
      const leadsResult = await client.query(leadsQuery)
      
      // Verificar campañas en lead_interactions
      const interactionsQuery = `
        SELECT DISTINCT campaign, COUNT(*) as interaction_count
        FROM lead_interactions 
        WHERE campaign IS NOT NULL
        GROUP BY campaign
        ORDER BY interaction_count DESC
      `
      
      const interactionsResult = await client.query(interactionsQuery)
      
      // Verificar campañas en campaign table
      const campaignTableQuery = `
        SELECT name, slug, id
        FROM campaign
        ORDER BY created_at DESC
      `
      
      const campaignTableResult = await client.query(campaignTableQuery)

      return {
        success: true,
        data: {
          campaigns_in_leads: leadsResult.rows,
          campaigns_in_interactions: interactionsResult.rows,
          campaigns_in_campaign_table: campaignTableResult.rows
        }
      }
    } catch (error) {
      console.error('Error checking campaigns:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }, event)
})