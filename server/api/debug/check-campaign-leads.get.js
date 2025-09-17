import { defineEventHandler, getQuery } from 'h3'
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { campaign_slug = 'asesoria-legal-gratis' } = query

  return await withPostgresClient(async (client) => {
    try {
      // 1. Verificar cuántos leads tiene la campaña en campaign_leads
      const campaignLeadsQuery = `
        SELECT 
          c.name as campaign_name,
          c.slug as campaign_slug,
          COUNT(cl.lead_id) as total_leads_in_campaign
        FROM campaign c
        LEFT JOIN campaign_leads cl ON c.id = cl.campaign_id
        WHERE c.slug = $1
        GROUP BY c.id, c.name, c.slug
      `
      
      const campaignResult = await client.query(campaignLeadsQuery, [campaign_slug])
      
      // 2. Verificar leads específicos de la campaña
      const leadsInCampaignQuery = `
        SELECT 
          l.id,
          p.email,
          p.name,
          l.is_verified,
          l.converted_at IS NOT NULL as is_converted,
          COUNT(DISTINCT li.id) as interaction_count,
          COUNT(DISTINCT CASE WHEN li.interaction_type = 'email_open' THEN li.id END) as email_open_count,
          COUNT(DISTINCT CASE WHEN li.interaction_type = 'email_click' THEN li.id END) as email_click_count
        FROM campaign c
        JOIN campaign_leads cl ON c.id = cl.campaign_id
        JOIN leads l ON cl.lead_id = l.id
        LEFT JOIN profile p ON l.profile_id = p.id
        LEFT JOIN lead_interactions li ON l.id = li.lead_id
        WHERE c.slug = $1
        GROUP BY l.id, p.email, p.name, l.is_verified, l.converted_at
        ORDER BY l.created_at DESC
      `
      
      const leadsResult = await client.query(leadsInCampaignQuery, [campaign_slug])
      
      // 3. Simular el filtro usado en create group (con filtros por defecto)
      const filteredLeadsQuery = `
        WITH lead_metrics AS (
          SELECT 
            l.id as lead_id,
            l.is_verified,
            l.converted_at,
            COUNT(DISTINCT li.id) as interaction_count,
            COUNT(DISTINCT CASE WHEN li.interaction_type = 'email_open' THEN li.id END) as email_open_count,
            COUNT(DISTINCT CASE WHEN li.interaction_type = 'email_click' THEN li.id END) as email_click_count,
            ARRAY_AGG(DISTINCT li.source) FILTER (WHERE li.source IS NOT NULL) as sources,
            ARRAY_AGG(DISTINCT li.medium) FILTER (WHERE li.medium IS NOT NULL) as mediums,
            ARRAY_AGG(DISTINCT li.campaign) FILTER (WHERE li.campaign IS NOT NULL) as campaigns,
            ARRAY_AGG(DISTINCT c.slug) FILTER (WHERE c.slug IS NOT NULL) as campaign_slugs
          FROM leads l
          LEFT JOIN lead_interactions li ON l.id = li.lead_id
          LEFT JOIN campaign_leads cl ON l.id = cl.lead_id
          LEFT JOIN campaign c ON cl.campaign_id = c.id
          GROUP BY l.id, l.is_verified, l.converted_at
        )
        SELECT *
        FROM lead_metrics
        WHERE $1 = ANY(campaign_slugs)
          AND interaction_count >= 0
          AND email_open_count >= 0
          AND email_click_count >= 0
          AND is_verified = false
          AND converted_at IS NULL
      `
      
      const filteredResult = await client.query(filteredLeadsQuery, [campaign_slug])

      return {
        success: true,
        data: {
          campaign_info: campaignResult.rows[0],
          all_leads_in_campaign: leadsResult.rows,
          leads_matching_filters: filteredResult.rows,
          summary: {
            total_leads_in_campaign: campaignResult.rows[0]?.total_leads_in_campaign || 0,
            leads_matching_filters_count: filteredResult.rows.length,
            difference: (campaignResult.rows[0]?.total_leads_in_campaign || 0) - filteredResult.rows.length
          }
        }
      }
    } catch (error) {
      console.error('Error checking campaign leads:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }, event)
})