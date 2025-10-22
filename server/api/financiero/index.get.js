// server/api/financiero/index.get.js

/**
 * API documentation endpoint para el módulo financiero
 * GET /api/financiero/ - Lista todos los endpoints disponibles
 */
export default defineEventHandler(async (event) => {
  return {
    success: true,
    module: 'Módulo Financiero - Warocol',
    version: '1.0.0',
    description: 'API endpoints para el dashboard financiero con métricas TIR, análisis de productos y planes de mejora',
    endpoints: [
      {
        path: '/api/financiero/tir-metrics',
        method: 'GET',
        description: 'Obtiene métricas TIR (Tasa Interna de Retorno) calculadas dinámicamente',
        parameters: {
          tenant_id: 'UUID del tenant (opcional)',
          period: 'Período de análisis: monthly, quarterly, yearly (default: monthly)',
          limit: 'Número de períodos a retornar (default: 12)'
        },
        response: {
          current: 'Métricas actuales (TIR, recuperación, ingresos)',
          charts: 'Datos para gráficos (labels, actualTir, projectedTir)',
          tables: 'Datos tabulares (actual, projected)',
          historical: 'Datos históricos completos'
        }
      },
      {
        path: '/api/financiero/product-analysis',
        method: 'GET',
        description: 'Análisis de rendimiento de productos con clasificación automática',
        parameters: {
          tenant_id: 'UUID del tenant (opcional)',
          category: 'Filtrar por categoría de producto (opcional)',
          min_margin: 'Margen mínimo de rentabilidad (opcional)',
          sort_by: 'Ordenar por: margin, sales, profit, impact (default: margin)',
          period: 'Días hacia atrás para análisis (default: 30)'
        },
        response: {
          products: 'Lista de productos con métricas de rendimiento',
          insights: 'Insights automáticos (productos estrella, optimización)',
          chartData: 'Datos para gráfico scatter (margen vs ventas)',
          summary: 'Resumen estadístico'
        }
      },
      {
        path: '/api/financiero/obstacles',
        method: 'GET',
        description: 'Obstáculos financieros identificados automáticamente con priorización',
        parameters: {
          tenant_id: 'UUID del tenant (opcional)'
        },
        response: {
          obstacles: 'Lista de obstáculos con impacto TIR y prioridad',
          priorityMatrix: 'Datos para matriz de priorización (impacto vs urgencia)',
          summary: 'Estadísticas de obstáculos'
        }
      },
      {
        path: '/api/financiero/improvement-plans',
        method: 'GET',
        description: 'Planes de mejora estructurados en fases con acciones específicas',
        parameters: {
          tenant_id: 'UUID del tenant (opcional)'
        },
        response: {
          plans: 'Planes de mejora en 3 fases con acciones detalladas',
          metrics: 'Métricas de progreso y estimaciones',
          timeline: 'Timeline de implementación',
          learningResources: 'Recursos educativos recomendados'
        }
      }
    ],
    database_views: [
      'v_financial_tir_metrics - Vista para cálculo dinámico de TIR',
      'v_product_analysis - Vista para análisis de productos',
      'v_improvement_plans - Vista para planes de mejora'
    ],
    stored_procedures: [
      'get_financial_obstacles() - Función para identificar obstáculos automáticamente'
    ],
    notes: [
      'Todos los cálculos se basan en datos reales de orders, order_items y products',
      'Las vistas se actualizan automáticamente con nuevos datos',
      'Los endpoints soportan filtrado por tenant para multi-tenancy',
      'Formato de respuesta consistente con success, data y timestamp'
    ]
  };
});