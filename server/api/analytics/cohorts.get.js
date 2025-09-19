import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;
  
  const query = getQuery(event);
  const {
    period_type = 'weekly',
    periods = 8,
    campaign_id,
    start_date,
    end_date
  } = query;

  return await withPostgresClient(async (client) => {
    try {
      console.log(`🔐 Análisis de cohortes basado en lead_interactions para tenant: ${tenantContext.tenant_name}`);
      
      // Determine period truncation for PostgreSQL
      let dateTrunc = 'week';
      if (period_type === 'monthly') dateTrunc = 'month';
      else if (period_type === 'bi-weekly') dateTrunc = 'week'; // We'll handle bi-weekly logic separately
      
      // Build campaign filter
      let campaignFilter = '';
      let campaignParams = [];
      let paramIndex = 1;
      
      if (campaign_id) {
        campaignFilter = `AND li.campaign_id = $${paramIndex}`;
        campaignParams = [campaign_id];
        paramIndex++;
      }
      
      // Build date filter
      let dateFilter = '';
      let dateParams = [];
      
      if (start_date) {
        dateFilter += ` AND li.created_at >= $${paramIndex}`;
        dateParams.push(start_date);
        paramIndex++;
      }
      
      if (end_date) {
        dateFilter += ` AND li.created_at <= $${paramIndex}`;
        dateParams.push(end_date);
        paramIndex++;
      }

      // Build tenant access logic
      let tenantAccessFilter = '';
      if (tenantContext.is_superuser) {
        // Superusers can see all lead interactions
        tenantAccessFilter = '';
      } else {
        // Regular users can only see leads from campaigns they own
        tenantAccessFilter = `AND (c.profile_id = ${tenantContext.user_id} OR li.campaign_id IS NULL)`;
      }

      // Get cohorts based on lead_capture interactions with proper tenant access
      const cohortsQuery = `
        WITH cohort_base AS (
          SELECT 
            DATE_TRUNC('${dateTrunc}', li.created_at) as cohort_period,
            li.campaign_id,
            COALESCE(c.name, 'Sin campaña') as campaign_name,
            COUNT(DISTINCT li.lead_id) as cohort_size,
            ARRAY_AGG(DISTINCT li.lead_id) as lead_ids
          FROM lead_interactions li
          LEFT JOIN campaign c ON li.campaign_id = c.id
          WHERE li.interaction_type = 'lead_capture'
            ${tenantAccessFilter}
            ${campaignFilter}
            ${dateFilter}
          GROUP BY DATE_TRUNC('${dateTrunc}', li.created_at), li.campaign_id, c.name
          ORDER BY cohort_period DESC
          LIMIT 10
        )
        SELECT * FROM cohort_base
      `;
      
      const queryParams = [...campaignParams, ...dateParams];
      const cohortsResult = await client.query(cohortsQuery, queryParams);
      
      // For each cohort, calculate retention periods
      const cohorts = [];
      
      for (const cohortRow of cohortsResult.rows) {
        const cohortPeriod = cohortRow.cohort_period;
        const leadIds = cohortRow.lead_ids;
        const cohortSize = parseInt(cohortRow.cohort_size);
        
        if (cohortSize === 0) continue;
        
        // Calculate periods dynamically
        const periodsData = [];
        
        for (let periodNum = 0; periodNum < parseInt(periods); periodNum++) {
          let periodStart, periodEnd;
          
          if (period_type === 'weekly') {
            periodStart = new Date(cohortPeriod);
            periodStart.setDate(periodStart.getDate() + (periodNum * 7));
            periodEnd = new Date(periodStart);
            periodEnd.setDate(periodEnd.getDate() + 6);
          } else if (period_type === 'bi-weekly') {
            periodStart = new Date(cohortPeriod);
            periodStart.setDate(periodStart.getDate() + (periodNum * 14));
            periodEnd = new Date(periodStart);
            periodEnd.setDate(periodEnd.getDate() + 13);
          } else { // monthly
            periodStart = new Date(cohortPeriod);
            periodStart.setMonth(periodStart.getMonth() + periodNum);
            periodEnd = new Date(periodStart);
            periodEnd.setMonth(periodEnd.getMonth() + 1);
            periodEnd.setDate(periodEnd.getDate() - 1);
          }
          
          // Count active leads in this period (any interaction except lead_capture for period > 0)
          let retentionQuery;
          let retentionParams;
          
          if (periodNum === 0) {
            // Period 0 is always 100% (cohort creation)
            periodsData.push({
              period_number: periodNum,
              active_leads: cohortSize,
              retention_rate: 100.0
            });
            continue;
          } else {
            // Count leads with any engagement interaction in this period
            if (tenantContext.is_superuser) {
              retentionQuery = `
                SELECT COUNT(DISTINCT li.lead_id) as active_count
                FROM lead_interactions li
                WHERE li.lead_id = ANY($1)
                  AND li.interaction_type IN ('email_open', 'email_click', 'email_sent', 'conversion')
                  AND li.created_at >= $2 
                  AND li.created_at <= $3
              `;
              retentionParams = [leadIds, periodStart.toISOString(), periodEnd.toISOString()];
            } else {
              retentionQuery = `
                SELECT COUNT(DISTINCT li.lead_id) as active_count
                FROM lead_interactions li
                LEFT JOIN campaign c ON li.campaign_id = c.id
                WHERE li.lead_id = ANY($1)
                  AND li.interaction_type IN ('email_open', 'email_click', 'email_sent', 'conversion')
                  AND li.created_at >= $2 
                  AND li.created_at <= $3
                  AND (c.profile_id = $4 OR li.campaign_id IS NULL)
              `;
              retentionParams = [leadIds, periodStart.toISOString(), periodEnd.toISOString(), tenantContext.user_id];
            }
          }
          
          const retentionResult = await client.query(retentionQuery, retentionParams);
          const activeCount = parseInt(retentionResult.rows[0]?.active_count || 0);
          const retentionRate = cohortSize > 0 ? (activeCount / cohortSize) * 100 : 0;
          
          periodsData.push({
            period_number: periodNum,
            active_leads: activeCount,
            retention_rate: Math.round(retentionRate * 10) / 10 // Round to 1 decimal
          });
        }
        
        cohorts.push({
          cohort_id: `${cohortPeriod.toISOString().split('T')[0]}_${cohortRow.campaign_id || 'none'}`,
          cohort_period: cohortPeriod.toISOString().split('T')[0],
          campaign_id: cohortRow.campaign_id,
          campaign_name: cohortRow.campaign_name,
          cohort_size: cohortSize,
          periods: periodsData,
          lead_ids: leadIds // Include for unique count calculation
        });
      }

      // Calculate summary metrics
      const calculateSummary = (cohorts) => {
        if (!cohorts.length) {
          return {
            total_cohorts: 0,
            total_leads: 0,
            total_segmented_leads: 0,
            total_activated_leads: 0,
            avg_retention_week_1: 0,
            avg_retention_week_4: 0,
            avg_segmentation_rate: 0,
            avg_activation_rate: 0
          };
        }
        
        // Calculate unique leads across all cohorts to avoid double counting
        const allLeadIds = new Set();
        cohorts.forEach(cohort => {
          if (cohort.lead_ids) {
            cohort.lead_ids.forEach(id => allLeadIds.add(id));
          }
        });
        const totalLeads = allLeadIds.size;
        
        let week1Total = 0, week4Total = 0, validWeek1 = 0, validWeek4 = 0;
        let totalSegmented = 0, totalActivated = 0;
        
        cohorts.forEach(cohort => {
          const week1Period = cohort.periods.find(p => p.period_number === 1);
          const week4Period = cohort.periods.find(p => p.period_number === 4);
          
          if (week1Period) {
            week1Total += week1Period.retention_rate;
            validWeek1++;
            totalActivated += week1Period.active_leads;
          }
          if (week4Period) {
            week4Total += week4Period.retention_rate;
            validWeek4++;
          }
          
          // Estimate segmented leads (leads with any follow-up interaction)
          const maxActiveInPeriods = Math.max(...cohort.periods.slice(1).map(p => p.active_leads));
          totalSegmented += maxActiveInPeriods;
        });
        
        return {
          total_cohorts: cohorts.length,
          total_leads: totalLeads,
          total_segmented_leads: totalSegmented,
          total_activated_leads: totalActivated,
          avg_retention_week_1: validWeek1 ? (week1Total / validWeek1) : 0,
          avg_retention_week_4: validWeek4 ? (week4Total / validWeek4) : 0,
          avg_segmentation_rate: totalLeads > 0 ? (totalSegmented / totalLeads) * 100 : 0,
          avg_activation_rate: totalLeads > 0 ? (totalActivated / totalLeads) * 100 : 0
        };
      };

      const summary = calculateSummary(cohorts);

      return {
        success: true,
        data: {
          cohorts: cohorts,
          summary: summary,
          period_type,
          periods: parseInt(periods)
        }
      };

    } catch (error) {
      console.error('Error in cohort analysis:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Error generating cohort analysis'
      });
    }
  });
});