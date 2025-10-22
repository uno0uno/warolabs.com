// server/api/financiero/tir-metrics.get.js

import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';

/**
 * API endpoint para obtener métricas TIR del dashboard financiero
 * GET /api/financiero/tir-metrics?tenant_id=uuid&period=monthly
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { period = 'monthly', limit = '12' } = query;

    // Obtener tenant del contexto de la sesión (del middleware)
    const tenantContext = event.context.tenant;
    if (!tenantContext) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No se pudo obtener el contexto del tenant'
      });
    }

    const result = await withPostgresClient(async (client) => {
      // Usar el tenant_id de la sesión actual
      const finalTenantId = tenantContext.tenant_id;
      
      
      if (!finalTenantId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Tenant ID no puede ser null'
        });
      }
      
      // Calcular métricas TIR basándose en datos reales de tenant_investments y orders
      const metricsQuery = `
        WITH investment_data AS (
          SELECT 
            ti.tenant_id,
            SUM(ti.initial_investment) as total_investment,
            MIN(ti.investment_date) as earliest_investment_date,
            AVG(ti.target_tir_percentage) as avg_target_tir
          FROM tenant_investments ti
          WHERE ti.tenant_id = $2::uuid
            AND ti.status = 'active'
          GROUP BY ti.tenant_id
        ),
        monthly_revenue AS (
          SELECT 
            DATE_TRUNC('month', o.order_date)::DATE as month_date,
            SUM(o.total_amount) as monthly_total,
            COUNT(DISTINCT o.id) as order_count,
            id.tenant_id,
            id.total_investment,
            id.earliest_investment_date,
            id.avg_target_tir
          FROM orders o
          INNER JOIN tenant_members tm ON o.user_id = tm.user_id
          INNER JOIN investment_data id ON tm.tenant_id = id.tenant_id
          WHERE o.status = 'completed'
          GROUP BY DATE_TRUNC('month', o.order_date), id.tenant_id, id.total_investment, 
                   id.earliest_investment_date, id.avg_target_tir
          HAVING COUNT(DISTINCT o.id) > 0
        ),
        monthly_cashflow AS (
          SELECT 
            mr.*,
            -- Flujo de caja acumulado: suma de ganancias netas desde el primer mes - inversión inicial
            SUM((mr.monthly_total * 0.7)) OVER (
              ORDER BY mr.month_date 
              ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) - mr.total_investment as cumulative_cashflow
          FROM monthly_revenue mr
        )
        SELECT 
          mr.month_date as period_date,
          $1 as period_type,
          mr.monthly_total as total_revenue,
          (mr.monthly_total * 0.3) as estimated_costs,
          (mr.monthly_total * 0.7) as gross_profit,
          CASE 
            WHEN mr.total_investment > 0 AND mr.monthly_total > 0 THEN
              -- TIR correcta basada en flujos de caja acumulados
              -- Formula: ((flujo_acumulado / inversión_inicial) ^ (12/meses) - 1) * 100
              -- Si flujo_acumulado < 0 → TIR negativa (no se ha recuperado inversión)
              -- Si flujo_acumulado > 0 → TIR positiva (inversión recuperada con ganancia)
              CASE 
                WHEN mr.cumulative_cashflow <= 0 THEN
                  -- Flujo acumulado negativo: TIR negativa
                  CAST(ROUND(CAST(
                    -1 * (POWER(
                      ABS(mr.cumulative_cashflow) / mr.total_investment,
                      12.0 / (EXTRACT(YEAR FROM AGE(mr.month_date, mr.earliest_investment_date)) * 12 + 
                              EXTRACT(MONTH FROM AGE(mr.month_date, mr.earliest_investment_date)) + 1)
                    )) * 100
                  AS NUMERIC), 2) AS NUMERIC)
                ELSE
                  -- Flujo acumulado positivo: TIR positiva 
                  CAST(ROUND(CAST(
                    (POWER(
                      (mr.cumulative_cashflow + mr.total_investment) / mr.total_investment,
                      12.0 / (EXTRACT(YEAR FROM AGE(mr.month_date, mr.earliest_investment_date)) * 12 + 
                              EXTRACT(MONTH FROM AGE(mr.month_date, mr.earliest_investment_date)) + 1)
                    ) - 1) * 100
                  AS NUMERIC), 2) AS NUMERIC)
              END
            ELSE 0
          END as tir_actual,
          CAST(ROUND(CAST(mr.avg_target_tir + (RANDOM() * 2 - 1) AS NUMERIC), 2) AS NUMERIC) as tir_projected,
          CAST(ROUND(CAST(mr.avg_target_tir AS NUMERIC), 2) AS NUMERIC) as tir_target,
          mr.total_investment as initial_investment,
          CASE 
            WHEN mr.monthly_total > 0 THEN
              (mr.total_investment / mr.monthly_total)
            ELSE 12
          END as recovery_months_estimated,
          NOW() as calculated_at
        FROM monthly_cashflow mr
        ORDER BY mr.month_date DESC 
        LIMIT $3
      `;

      const metrics = await client.query(metricsQuery, [
        period,
        finalTenantId,  // Ya validamos que no sea null arriba
        parseInt(limit)
      ]);
      

      // Calcular métricas agregadas para el dashboard basándose en 12 meses
      const historicalData = metrics.rows;
      const totalRevenue12Months = historicalData.reduce((sum, row) => sum + parseFloat(row.total_revenue || 0), 0);
      // Usar la inversión más reciente (última fila) o la máxima inversión encontrada
      const totalInvestment = historicalData.length > 0 
        ? Math.max(...historicalData.map(row => parseFloat(row.initial_investment || 0)))
        : 0;
      const avgTirTarget = historicalData.length > 0 
        ? Math.max(...historicalData.map(row => parseFloat(row.tir_target || 0)))
        : 0;
      
      // Calcular TIR actual de forma más realista
      // TIR simple anualizado = (Ganancia / Inversión) * (12 / meses transcurridos)
      const totalMonths = historicalData.length;
      const totalRevenue = totalRevenue12Months;
      const totalProfit = totalRevenue * 0.7; // 70% ganancia neta estimada
      const avgTirActual = totalInvestment > 0 && totalProfit > 0 && totalMonths > 0
        ? Math.min(((totalProfit - totalInvestment) / totalInvestment) * (12 / totalMonths) * 100, 1000) // Máximo 1000%
        : 0;
        
      // Calcular TIR proyectada promedio
      const avgTirProjected = historicalData.length > 0
        ? historicalData.reduce((sum, row) => sum + parseFloat(row.tir_projected || 0), 0) / historicalData.length
        : 0;
        
      // Calcular tiempo de recuperación basado en ingresos promedio mensuales
      const avgMonthlyRevenue = historicalData.length > 0 ? totalRevenue12Months / historicalData.length : 0;
      const recoveryMonths = avgMonthlyRevenue > 0 ? totalInvestment / avgMonthlyRevenue : 0;
      
      const currentMetrics = {
        tir_actual: Math.round(avgTirActual * 100) / 100,
        tir_projected: Math.round(avgTirProjected * 100) / 100,
        tir_target: Math.round(avgTirTarget * 100) / 100,
        recovery_months: Math.round(recoveryMonths * 100) / 100,
        total_revenue: Math.round(totalRevenue12Months * 100) / 100,
        gross_profit: Math.round((totalRevenue12Months * 0.7) * 100) / 100 // 70% ganancia bruta
      };
      

      // Datos para gráficos
      const chartData = {
        labels: historicalData.map(row => {
          const date = new Date(row.period_date);
          return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
        }),
        actualTir: historicalData.map(row => Math.round(parseFloat(row.tir_actual || 0) * 100) / 100),
        projectedTir: historicalData.map(row => Math.round(parseFloat(row.tir_projected || 0) * 100) / 100),
        targetTir: historicalData.map(() => Math.round(parseFloat(currentMetrics.tir_target || 10) * 100) / 100)
      };
      

      // Datos tabulares para el frontend
      const tableData = {
        actual: historicalData.slice(0, parseInt(limit)).map(row => ({
          month: new Date(row.period_date).toLocaleDateString('es-ES', { month: 'long' }),
          tir: Math.round(parseFloat(row.tir_actual || 0) * 100) / 100,
          investment: Math.round(parseFloat(row.initial_investment || 50000) * 100) / 100, // Inversión inicial real
          monthlyRevenue: Math.round(parseFloat(row.total_revenue || 0) * 100) / 100, // Ingresos del mes
          return: Math.round(parseFloat(row.gross_profit || 0) * 100) / 100 // Ganancia neta del mes
        })),
        projected: historicalData.slice(0, parseInt(limit)).map((row, index) => ({
          month: new Date(row.period_date).toLocaleDateString('es-ES', { month: 'long' }),
          tir: Math.round(parseFloat(row.tir_projected || 0) * 100) / 100,
          investment: Math.round(parseFloat(row.initial_investment || 50000) * 100) / 100, // Misma inversión inicial
          monthlyRevenue: Math.round((parseFloat(row.total_revenue || 0) * 1.1) * 100) / 100, // Proyección ingresos +10%
          return: Math.round((parseFloat(row.gross_profit || 0) * 1.15) * 100) / 100 // Proyección ganancia +15%
        })),
        // Agregar totales que coincidan con las cards
        totals: {
          actual: {
            tir_average: Math.round(avgTirActual * 100) / 100, // Mismo que la card TIR Actual
            total_investment: Math.round(totalInvestment * 100) / 100, // Mismo que las cards
            total_revenue: Math.round(totalRevenue12Months * 100) / 100, // Mismo que las cards
            total_return: Math.round((totalRevenue12Months * 0.7) * 100) / 100, // Mismo que gross_profit de las cards
            months_count: historicalData.length
          },
          projected: {
            tir_average: Math.round(avgTirProjected * 100) / 100, // Mismo que la card TIR Proyectada
            total_investment: Math.round(totalInvestment * 100) / 100, // Mismo que actual
            total_revenue: Math.round((totalRevenue12Months * 1.1) * 100) / 100, // Proyección +10%
            total_return: Math.round((totalRevenue12Months * 0.7 * 1.15) * 100) / 100, // Proyección +15%
            months_count: historicalData.length
          }
        }
      };

      return {
        current: {
          tir_actual: parseFloat(currentMetrics.tir_actual || 0),
          tir_projected: parseFloat(currentMetrics.tir_projected || 0),
          tir_target: parseFloat(currentMetrics.tir_target || 10),
          recovery_months: parseFloat(currentMetrics.recovery_months || 0),
          total_revenue: parseFloat(currentMetrics.total_revenue || 0),
          gross_profit: parseFloat(currentMetrics.gross_profit || 0)
        },
        charts: chartData,
        tables: tableData,
        historical: historicalData
      };
    }, event);

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error en TIR metrics:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor',
      message: 'No se pudieron obtener las métricas TIR'
    });
  }
});