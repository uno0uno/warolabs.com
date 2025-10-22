// server/api/financiero/obstacles-analysis.get.js

import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';

/**
 * API endpoint for business obstacles analysis
 * GET /api/financiero/obstacles-analysis?tenant_id=uuid&period=30
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { tenant_id, period = '30' } = query;

    console.log('🔄 Starting obstacles analysis query...')
    
    const result = await withPostgresClient(async (client) => {
      console.log('📊 Database client connected, executing obstacles query...')
      
      // Comprehensive obstacles analysis using real data
      const obstaclesQuery = `
        WITH recent_orders AS (
          SELECT 
            o.id as order_id,
            o.order_date,
            o.total_amount,
            o.status,
            o.user_id,
            tm.tenant_id
          FROM orders o
          INNER JOIN tenant_members tm ON o.user_id = tm.user_id
          WHERE o.order_date >= NOW() - INTERVAL '${parseInt(period)} days'
        ),
        payment_analysis AS (
          SELECT 
            COUNT(*) as total_payments,
            COUNT(CASE WHEN p.status = 'APPROVED' THEN 1 END) as successful_payments,
            COUNT(CASE WHEN p.status IN ('DECLINED', 'FAILED', 'PENDING') THEN 1 END) as failed_payments,
            COALESCE(SUM(CASE WHEN p.status IN ('DECLINED', 'FAILED') THEN p.amount ELSE 0 END), 0) as lost_revenue,
            STRING_AGG(DISTINCT p.status_message, ', ') as failure_reasons
          FROM payments p
          INNER JOIN orders o ON p.order_id = o.id
          INNER JOIN tenant_members tm ON o.user_id = tm.user_id
          WHERE p.payment_date >= NOW() - INTERVAL '${parseInt(period)} days'
        ),
        inventory_analysis AS (
          SELECT 
            COUNT(*) as total_products,
            COUNT(CASE WHEN pv.stock_quantity = 0 THEN 1 END) as out_of_stock,
            COUNT(CASE WHEN pv.stock_quantity > 0 AND pv.stock_quantity <= 5 THEN 1 END) as low_stock,
            COUNT(CASE WHEN pv.stock_quantity > 5 THEN 1 END) as healthy_stock,
            COUNT(CASE WHEN it.transaction_type IN ('loss', 'adjustment') AND it.quantity_change < 0 THEN 1 END) as inventory_issues,
            COALESCE(SUM(CASE WHEN it.transaction_type IN ('loss', 'adjustment') AND it.quantity_change < 0 THEN ABS(it.quantity_change) ELSE 0 END), 0) as units_lost
          FROM product_variants pv
          INNER JOIN product p ON pv.product_id = p.id
          LEFT JOIN inventory_transactions it ON pv.id = it.variant_id 
            AND it.transaction_date >= NOW() - INTERVAL '${parseInt(period)} days'
          WHERE pv.is_active = true
        ),
        order_processing_analysis AS (
          SELECT 
            COUNT(*) as total_orders,
            COUNT(CASE WHEN ro.status = 'completed' THEN 1 END) as completed_orders,
            COUNT(CASE WHEN ro.status = 'cancelled' THEN 1 END) as cancelled_orders,
            COUNT(CASE WHEN ro.status IN ('pending', 'processing') THEN 1 END) as stuck_orders,
            COUNT(CASE WHEN osh.reason LIKE '%delay%' OR osh.reason LIKE '%problem%' THEN 1 END) as delayed_orders,
            STRING_AGG(DISTINCT CASE WHEN osh.new_status = 'cancelled' THEN osh.reason END, ', ') as cancellation_reasons
          FROM recent_orders ro
          LEFT JOIN order_status_history osh ON ro.order_id = osh.order_id
        ),
        financial_metrics AS (
          SELECT 
            COALESCE(SUM(ro.total_amount), 0) as total_revenue,
            COALESCE(AVG(ro.total_amount), 0) as avg_order_value,
            (SELECT COALESCE(SUM(ti.initial_investment), 50000) FROM tenant_investments ti WHERE ti.status = 'active') as total_investment
          FROM recent_orders ro
          WHERE ro.status = 'completed'
        )
        SELECT 
          -- Payment metrics
          pa.total_payments,
          pa.successful_payments, 
          pa.failed_payments,
          pa.lost_revenue,
          pa.failure_reasons,
          ROUND(
            CASE WHEN pa.total_payments > 0 THEN
              (pa.failed_payments::DECIMAL / pa.total_payments) * 100
            ELSE 0 END, 2
          ) as payment_failure_rate,
          
          -- Inventory metrics
          ia.total_products,
          ia.out_of_stock,
          ia.low_stock,
          ia.healthy_stock,
          ia.inventory_issues,
          ia.units_lost,
          ROUND(
            CASE WHEN ia.total_products > 0 THEN
              ((ia.out_of_stock + ia.low_stock)::DECIMAL / ia.total_products) * 100
            ELSE 0 END, 2
          ) as stock_risk_percentage,
          
          -- Order processing metrics
          opa.total_orders,
          opa.completed_orders,
          opa.cancelled_orders,
          opa.stuck_orders,
          opa.delayed_orders,
          opa.cancellation_reasons,
          ROUND(
            CASE WHEN opa.total_orders > 0 THEN
              (opa.cancelled_orders::DECIMAL / opa.total_orders) * 100
            ELSE 0 END, 2
          ) as cancellation_rate,
          ROUND(
            CASE WHEN opa.total_orders > 0 THEN
              (opa.completed_orders::DECIMAL / opa.total_orders) * 100
            ELSE 0 END, 2
          ) as order_success_rate,
          
          -- Financial metrics
          fm.total_revenue,
          fm.avg_order_value,
          fm.total_investment
          
        FROM payment_analysis pa
        CROSS JOIN inventory_analysis ia
        CROSS JOIN order_processing_analysis opa
        CROSS JOIN financial_metrics fm;
      `;

      console.log('🚀 Executing obstacles SQL query...')
      const obstaclesResult = await client.query(obstaclesQuery);
      console.log('✅ Obstacles query executed successfully')

      const data = obstaclesResult.rows[0] || {};
      
      // Generate insights and recommendations based on real data
      const insights = {
        critical_obstacles: [],
        warning_obstacles: [],
        recommendations: []
      };
      
      // Critical obstacles (immediate action needed)
      if (parseFloat(data.payment_failure_rate || 0) > 10) {
        insights.critical_obstacles.push({
          type: 'payment_processing',
          severity: 'critical',
          title: 'High Payment Failure Rate',
          description: `${data.payment_failure_rate}% of payments are failing`,
          impact: `Lost revenue: $${Math.round(parseFloat(data.lost_revenue || 0))}`,
          action: 'Check payment gateway configuration and customer payment methods',
          details: data.failure_reasons || 'Various payment issues detected'
        });
      }
      
      if (parseFloat(data.stock_risk_percentage || 0) > 30) {
        insights.critical_obstacles.push({
          type: 'inventory_management',
          severity: 'critical', 
          title: 'Inventory Crisis',
          description: `${data.stock_risk_percentage}% of products have stock issues`,
          impact: `${data.out_of_stock} products out of stock, ${data.low_stock} running low`,
          action: 'Immediate inventory replenishment and supply chain review',
          details: `${data.units_lost} units lost due to damage/expiration`
        });
      }
      
      if (parseFloat(data.cancellation_rate || 0) > 15) {
        insights.critical_obstacles.push({
          type: 'order_fulfillment',
          severity: 'critical',
          title: 'High Order Cancellation Rate', 
          description: `${data.cancellation_rate}% of orders are being cancelled`,
          impact: `${data.cancelled_orders} cancelled orders out of ${data.total_orders} total`,
          action: 'Investigate cancellation reasons and improve order process',
          details: data.cancellation_reasons || 'Various cancellation reasons'
        });
      }
      
      // Warning obstacles (attention needed)
      if (parseInt(data.stuck_orders || 0) > 0) {
        insights.warning_obstacles.push({
          type: 'operational_efficiency',
          severity: 'warning',
          title: 'Orders Stuck in Processing',
          description: `${data.stuck_orders} orders stuck in pending/processing state`,
          impact: 'Customer satisfaction and cash flow affected',
          action: 'Review order workflow and resolve processing bottlenecks'
        });
      }
      
      if (parseInt(data.delayed_orders || 0) > 0) {
        insights.warning_obstacles.push({
          type: 'logistics',
          severity: 'warning',
          title: 'Order Processing Delays',
          description: `${data.delayed_orders} orders experienced processing delays`,
          impact: 'Customer satisfaction at risk',
          action: 'Optimize fulfillment process and improve logistics'
        });
      }
      
      if (parseInt(data.inventory_issues || 0) > 0) {
        insights.warning_obstacles.push({
          type: 'inventory_quality',
          severity: 'warning',
          title: 'Inventory Quality Issues',
          description: `${data.inventory_issues} inventory adjustments due to damage/loss`,
          impact: `${data.units_lost} units lost this period`,
          action: 'Review storage conditions and supplier quality standards'
        });
      }
      
      // Generate recommendations
      if (insights.critical_obstacles.length > 0) {
        insights.recommendations.push('Address critical obstacles immediately - they directly impact revenue');
        insights.recommendations.push('Set up monitoring alerts for payment processing and inventory levels');
      }
      
      if (insights.warning_obstacles.length > 0) {
        insights.recommendations.push('Review operational processes to prevent warning issues from becoming critical');
      }
      
      if (insights.critical_obstacles.length === 0 && insights.warning_obstacles.length === 0) {
        insights.recommendations.push('Operations running smoothly - focus on growth and optimization opportunities');
        insights.recommendations.push('Consider implementing preventive monitoring systems');
      }
      
      // Calculate health score
      const healthScore = Math.max(0, 100 - (insights.critical_obstacles.length * 25) - (insights.warning_obstacles.length * 10));

      return {
        metrics: {
          // Payment Health
          payment_failure_rate: parseFloat(data.payment_failure_rate || 0),
          failed_payments_count: parseInt(data.failed_payments || 0),
          successful_payments_count: parseInt(data.successful_payments || 0),
          lost_revenue_payments: Math.round(parseFloat(data.lost_revenue || 0)),
          
          // Inventory Health
          stock_risk_percentage: parseFloat(data.stock_risk_percentage || 0),
          out_of_stock_count: parseInt(data.out_of_stock || 0),
          low_stock_count: parseInt(data.low_stock || 0),
          healthy_stock_count: parseInt(data.healthy_stock || 0),
          inventory_issues_count: parseInt(data.inventory_issues || 0),
          units_lost: parseInt(data.units_lost || 0),
          
          // Order Processing Health
          order_success_rate: parseFloat(data.order_success_rate || 0),
          cancellation_rate: parseFloat(data.cancellation_rate || 0),
          completed_orders_count: parseInt(data.completed_orders || 0),
          cancelled_orders_count: parseInt(data.cancelled_orders || 0),
          stuck_orders_count: parseInt(data.stuck_orders || 0),
          delayed_orders_count: parseInt(data.delayed_orders || 0),
          
          // Financial Health
          total_orders: parseInt(data.total_orders || 0),
          total_revenue: Math.round(parseFloat(data.total_revenue || 0)),
          avg_order_value: Math.round(parseFloat(data.avg_order_value || 0)),
          total_investment: Math.round(parseFloat(data.total_investment || 0))
        },
        obstacles_summary: {
          critical_count: insights.critical_obstacles.length,
          warning_count: insights.warning_obstacles.length,
          total_obstacles: insights.critical_obstacles.length + insights.warning_obstacles.length,
          health_score: Math.round(healthScore)
        },
        insights: insights,
        period_info: {
          period_days: parseInt(period),
          analysis_date: new Date().toISOString()
        }
      };
    }, event);

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error in obstacles analysis:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      message: 'Could not get obstacles analysis data'
    });
  }
});