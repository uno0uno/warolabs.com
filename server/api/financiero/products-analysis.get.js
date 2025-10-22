// server/api/financiero/products-analysis.get.js

import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';

/**
 * API endpoint para obtener análisis de productos del dashboard financiero
 * GET /api/financiero/products-analysis?tenant_id=uuid&period=30&category=pasta&min_margin=50
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { period = '365', category, min_margin, sort_by = 'margin' } = query;

    // Obtener tenant del contexto de la sesión (del middleware)
    const tenantContext = event.context.tenant;
    if (!tenantContext) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No se pudo obtener el contexto del tenant'
      });
    }

    console.log('🔄 Iniciando consulta de análisis de productos...')
    
    const result = await withPostgresClient(async (client) => {
      const finalTenantId = tenantContext.tenant_id;
      
      if (!finalTenantId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Tenant ID no puede ser null'
        });
      }

      console.log('📊 Cliente de base de datos conectado, ejecutando query...')
      
      // Análisis de productos basado en datos reales de órdenes completadas
      const productsQuery = `
        WITH recent_orders AS (
          SELECT 
            o.id as order_id,
            o.order_date,
            o.total_amount,
            o.user_id,
            oi.variant_id,
            oi.quantity,
            oi.price_at_purchase,
            tm.tenant_id
          FROM orders o
          INNER JOIN order_items oi ON o.id = oi.order_id
          INNER JOIN tenant_members tm ON o.user_id = tm.user_id
          WHERE o.status = 'completed'
            AND tm.tenant_id = $1::uuid
            AND o.order_date >= NOW() - INTERVAL '${parseInt(period)} days'
        ),
        product_analytics AS (
          SELECT 
            p.id,
            p.name,
            p.price,
            c.name as category_name,
            -- Datos reales de ventas
            COALESCE(SUM(ro.quantity), 0) as total_sales,
            COALESCE(SUM(ro.price_at_purchase * ro.quantity), 0) as total_revenue,
            -- Calcular costo estimado basado en precio (60% del precio como costo)
            p.price * 0.6 as avg_unit_cost,
            -- Calcular margen basado en precio menos costo estimado
            CASE 
              WHEN p.price > 0 THEN
                ROUND(((p.price - (p.price * 0.6)) / p.price) * 100, 2)
              ELSE 0
            END as real_margin,
            -- Calcular ganancia real basada en ventas menos costos estimados
            COALESCE(
              SUM(ro.quantity * (ro.price_at_purchase - (p.price * 0.6))), 
              0
            ) as real_profit,
            -- Contar órdenes en el período
            COUNT(DISTINCT ro.order_id) as order_count,
            -- Fecha de último pedido
            MAX(ro.order_date) as last_order_date,
            -- TIR impact basado en contribución a ingresos totales
            CASE 
              WHEN SUM(ro.price_at_purchase * ro.quantity) > 0 THEN
                ROUND(
                  (SUM(ro.price_at_purchase * ro.quantity) / 
                   NULLIF((SELECT SUM(total_amount) FROM orders o2 
                          INNER JOIN tenant_members tm2 ON o2.user_id = tm2.user_id 
                          WHERE o2.status = 'completed' 
                          AND o2.order_date >= NOW() - INTERVAL '${parseInt(period)} days'), 0)
                  ) * 100, 2
                )
              ELSE 0
            END as tir_impact_percentage
          FROM product p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN product_variants pv ON p.id = pv.product_id
          INNER JOIN recent_orders ro ON pv.id = ro.variant_id
          GROUP BY p.id, p.name, p.price, c.name
          HAVING SUM(ro.quantity) > 0
        ),
        categorized_products AS (
          SELECT 
            *,
            -- Clasificar productos según rendimiento real
            CASE 
              WHEN real_margin >= 70 AND total_sales >= 20 THEN 'Star'
              WHEN real_margin >= 60 AND total_sales >= 10 THEN 'Potential'  
              WHEN real_margin >= 50 AND total_sales >= 5 THEN 'Average'
              WHEN real_margin < 50 OR total_sales < 5 THEN 'Low Performance'
              ELSE 'Problematic'
            END as classification
          FROM product_analytics
        )
        SELECT * FROM categorized_products
        WHERE 1=1
          ${category ? `AND LOWER(category_name) = LOWER('${category}')` : ''}
          ${min_margin ? `AND real_margin >= ${parseInt(min_margin)}` : ''}
        ORDER BY 
          CASE 
            WHEN '${sort_by}' = 'margin' THEN real_margin
            WHEN '${sort_by}' = 'sales' THEN total_sales
            WHEN '${sort_by}' = 'profit' THEN real_profit
            WHEN '${sort_by}' = 'impact' THEN tir_impact_percentage
            ELSE real_margin
          END DESC
        LIMIT 50;
      `;

      console.log('🚀 Ejecutando query SQL...')
      const products = await client.query(productsQuery, [finalTenantId]);
      console.log('✅ Query ejecutada exitosamente, filas obtenidas:', products.rows.length)

      // Query para obtener categorías disponibles
      const categoriesQuery = `
        WITH recent_orders_for_categories AS (
          SELECT DISTINCT oi.variant_id
          FROM orders o
          INNER JOIN order_items oi ON o.id = oi.order_id
          INNER JOIN tenant_members tm ON o.user_id = tm.user_id
          WHERE o.status = 'completed'
            AND tm.tenant_id = $1::uuid
            AND o.order_date >= NOW() - INTERVAL '${parseInt(period)} days'
        )
        SELECT DISTINCT c.name as category_name
        FROM categories c
        INNER JOIN product p ON c.id = p.category_id
        INNER JOIN product_variants pv ON p.id = pv.product_id
        INNER JOIN recent_orders_for_categories ro ON pv.id = ro.variant_id
        WHERE c.name IS NOT NULL AND c.name != ''
        ORDER BY c.name
      `;
      
      console.log('🏷️ Obteniendo categorías disponibles...')
      const categories = await client.query(categoriesQuery, [finalTenantId]);
      console.log('✅ Categorías obtenidas:', categories.rows.length)

      // Calcular métricas agregadas
      const analytics = products.rows;
      
      const bestMarginProduct = analytics.reduce((best, current) => 
        current.real_margin > (best?.real_margin || 0) ? current : best, null);
      
      const activeProducts = analytics.filter(p => p.total_sales > 0).length;
      const lowPerformanceProducts = analytics.filter(p => p.classification === 'Low Performance' || p.classification === 'Problematic').length;
      
      const totalRevenue = analytics.reduce((sum, p) => sum + parseFloat(p.total_revenue || 0), 0);
      const totalProfit = analytics.reduce((sum, p) => sum + parseFloat(p.real_profit || 0), 0);
      
      // Generar insights automáticos
      const starProducts = analytics.filter(p => p.classification === 'Star');
      const problematicProducts = analytics.filter(p => p.classification === 'Problematic');
      
      const insights = {
        star_products: {
          count: starProducts.length,
          revenue_percentage: totalRevenue > 0 ? Math.round((starProducts.reduce((sum, p) => sum + parseFloat(p.total_revenue || 0), 0) / totalRevenue) * 100) : 0,
          top_product: starProducts[0]?.name || 'N/A'
        },
        optimization_needed: {
          count: analytics.filter(p => p.real_margin < 60).length,
          lowest_margin_product: analytics.reduce((lowest, current) => 
            current.real_margin < (lowest?.real_margin || 100) ? current : lowest, null)
        },
        low_performance: {
          count: lowPerformanceProducts,
          potential_tir_improvement: Math.round(lowPerformanceProducts * 0.2 * 100) / 100
        }
      };

      return {
        categories: categories.rows.map(row => row.category_name), // ← Incluir categorías en la respuesta
        metrics: {
          best_margin: {
            percentage: bestMarginProduct?.real_margin || 0,
            product_name: bestMarginProduct?.name || 'N/A'
          },
          active_products: activeProducts,
          low_performance_count: lowPerformanceProducts,
          total_revenue: Math.round(totalRevenue),
          total_profit: Math.round(totalProfit)
        },
        products: analytics.map(product => ({
          id: product.id,
          name: product.name,
          category: product.category_name || 'No category',
          margin: parseFloat(product.real_margin || 0),
          sales: parseInt(product.total_sales || 0),
          cost: Math.round(parseFloat(product.avg_unit_cost || 0)), // Costo real
          profit: Math.round(parseFloat(product.real_profit || 0)),
          tirImpact: parseFloat(product.tir_impact_percentage || 0),
          classification: product.classification,
          price: parseFloat(product.price || 0),
          order_count: parseInt(product.order_count || 0),
          last_order_date: product.last_order_date
        })),
        insights: insights,
        filters: {
          period: parseInt(period),
          category: category || null,
          min_margin: min_margin ? parseInt(min_margin) : null,
          sort_by: sort_by
        }
      };
    }, event);

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error en análisis de productos:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor',
      message: 'No se pudieron obtener los datos de análisis de productos'
    });
  }
});