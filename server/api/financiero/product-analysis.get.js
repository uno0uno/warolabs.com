// server/api/financiero/product-analysis.get.js

import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';

/**
 * API endpoint para obtener análisis de productos del módulo financiero
 * GET /api/financiero/product-analysis?tenant_id=uuid&category=&min_margin=&sort_by=margin
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { 
      tenant_id, 
      category, 
      min_margin,
      sort_by = 'margin',
      period = '30'
    } = query;

    const result = await withPostgresClient(async (client) => {
      // Consultar vista de análisis de productos
      const productsQuery = `
        SELECT 
          tenant_id,
          product_id,
          product_name,
          category_name,
          sale_price,
          estimated_unit_cost,
          units_sold,
          total_revenue,
          total_cost,
          gross_profit,
          margin_percentage,
          tir_impact,
          classification,
          sales_month,
          calculated_at
        FROM v_product_analysis 
        WHERE ($1::uuid IS NULL OR tenant_id = $1)
          AND ($2::text IS NULL OR category_name = $2)
          AND ($3::decimal IS NULL OR margin_percentage >= $3)
          AND sales_month >= CURRENT_DATE - INTERVAL '$4 days'
        ORDER BY 
          CASE 
            WHEN $5 = 'margin' THEN margin_percentage
            WHEN $5 = 'sales' THEN units_sold
            WHEN $5 = 'profit' THEN gross_profit
            WHEN $5 = 'impact' THEN tir_impact
            ELSE margin_percentage
          END DESC,
          tir_impact DESC
      `;

      const products = await client.query(productsQuery, [
        tenant_id || null,
        category || null,
        min_margin ? parseFloat(min_margin) : null,
        period,
        sort_by
      ]);

      // Calcular métricas agregadas
      const totalProducts = products.rows.length;
      const avgMargin = products.rows.reduce((sum, p) => sum + parseFloat(p.margin_percentage || 0), 0) / totalProducts || 0;
      
      const classifications = products.rows.reduce((acc, p) => {
        acc[p.classification] = (acc[p.classification] || 0) + 1;
        return acc;
      }, {});

      const bestMarginProduct = products.rows.reduce((best, current) => 
        parseFloat(current.margin_percentage || 0) > parseFloat(best.margin_percentage || 0) ? current : best
      , products.rows[0] || {});

      // Insights automáticos
      const insights = {
        productos_estrella: classifications.Estrella || 0,
        necesitan_optimizacion: classifications.Problemático || 0,
        bajo_rendimiento: classifications['Bajo Rendimiento'] || 0,
        margen_promedio: Math.round(avgMargin * 100) / 100,
        mejor_producto: bestMarginProduct.product_name || 'N/A',
        mejor_margen: Math.round(parseFloat(bestMarginProduct.margin_percentage || 0) * 100) / 100
      };

      // Datos para el gráfico scatter (margen vs ventas)
      const chartData = products.rows.map(p => ({
        x: parseInt(p.units_sold || 0),
        y: parseFloat(p.margin_percentage || 0),
        product: p.product_name,
        category: p.category_name,
        classification: p.classification
      }));

      // Formatear datos para el frontend
      const formattedProducts = products.rows.map(p => ({
        name: p.product_name,
        category: p.category_name,
        margin: Math.round(parseFloat(p.margin_percentage || 0) * 100) / 100,
        sales: parseInt(p.units_sold || 0),
        cost: parseFloat(p.total_cost || 0),
        profit: parseFloat(p.gross_profit || 0),
        tirImpact: parseFloat(p.tir_impact || 0),
        classification: p.classification
      }));

      return {
        products: formattedProducts,
        insights,
        chartData,
        summary: {
          total_products: totalProducts,
          avg_margin: Math.round(avgMargin * 100) / 100,
          classifications
        }
      };

    }, event);

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error en product analysis:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor',
      message: 'No se pudo obtener el análisis de productos'
    });
  }
});