// server/api/financiero/obstacles.get.js

import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';

/**
 * API endpoint para obtener obstáculos financieros identificados automáticamente
 * GET /api/financiero/obstacles?tenant_id=uuid
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { tenant_id } = query;

    const result = await withPostgresClient(async (client) => {
      // Consultar función de obstáculos financieros
      const obstaclesQuery = `
        SELECT 
          obstacle_name,
          obstacle_type,
          current_value,
          optimal_range,
          deviation_percentage,
          tir_impact,
          priority_level,
          status
        FROM get_financial_obstacles($1)
        ORDER BY 
          CASE priority_level 
            WHEN 'CRÍTICO' THEN 1
            WHEN 'ALTO' THEN 2  
            WHEN 'MEDIO' THEN 3
            WHEN 'BAJO' THEN 4
          END,
          ABS(tir_impact) DESC
      `;

      const obstacles = await client.query(obstaclesQuery, [tenant_id || null]);

      // Calcular matriz de priorización para el gráfico
      const priorityMatrix = obstacles.rows.map(obstacle => {
        // Simular coordenadas de impacto vs urgencia
        let impactScore, urgencyScore;
        
        switch (obstacle.obstacle_name) {
          case 'Costos de Alimentos':
            impactScore = Math.abs(parseFloat(obstacle.tir_impact || 0)) * 5; // Escala 0-10
            urgencyScore = obstacle.priority_level === 'CRÍTICO' ? 9 : obstacle.priority_level === 'ALTO' ? 7 : 5;
            break;
          case 'Productos Bajo Margen':
            impactScore = Math.abs(parseFloat(obstacle.tir_impact || 0)) * 10;
            urgencyScore = obstacle.priority_level === 'CRÍTICO' ? 8 : obstacle.priority_level === 'ALTO' ? 6 : 4;
            break;
          case 'Rotación Inventario':
            impactScore = Math.abs(parseFloat(obstacle.tir_impact || 0)) * 15;
            urgencyScore = obstacle.priority_level === 'CRÍTICO' ? 7 : obstacle.priority_level === 'ALTO' ? 5 : 3;
            break;
          default:
            impactScore = Math.abs(parseFloat(obstacle.tir_impact || 0)) * 8;
            urgencyScore = 5;
        }

        return {
          x: Math.min(10, Math.max(0, impactScore)),
          y: Math.min(10, Math.max(0, urgencyScore)),
          obstacle: obstacle.obstacle_name,
          type: obstacle.obstacle_type,
          priority: obstacle.priority_level
        };
      });

      // Formatear obstáculos para el frontend
      const formattedObstacles = obstacles.rows.map(obstacle => ({
        name: obstacle.obstacle_name,
        type: obstacle.obstacle_type,
        currentValue: obstacle.current_value,
        optimalRange: obstacle.optimal_range,
        deviation: obstacle.deviation_percentage ? `${obstacle.deviation_percentage > 0 ? '+' : ''}${obstacle.deviation_percentage}%` : '0%',
        tirImpact: parseFloat(obstacle.tir_impact || 0),
        priority: obstacle.priority_level,
        status: obstacle.status
      }));

      // Calcular estadísticas de obstáculos
      const summary = {
        total_obstacles: obstacles.rows.length,
        critical_count: obstacles.rows.filter(o => o.priority_level === 'CRÍTICO').length,
        high_count: obstacles.rows.filter(o => o.priority_level === 'ALTO').length,
        total_tir_impact: obstacles.rows.reduce((sum, o) => sum + parseFloat(o.tir_impact || 0), 0),
        avg_deviation: obstacles.rows.reduce((sum, o) => sum + parseFloat(o.deviation_percentage || 0), 0) / obstacles.rows.length || 0
      };

      return {
        obstacles: formattedObstacles,
        priorityMatrix,
        summary
      };

    }, event);

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error en financial obstacles:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor',
      message: 'No se pudieron obtener los obstáculos financieros'
    });
  }
});