// server/api/financiero/improvement-plans.get.js

import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';

/**
 * API endpoint para obtener planes de mejora financiera estructurados en fases
 * GET /api/financiero/improvement-plans?tenant_id=uuid
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { tenant_id } = query;

    const result = await withPostgresClient(async (client) => {
      // Consultar vista de planes de mejora
      const plansQuery = `
        SELECT 
          phase_number,
          title,
          estimated_days,
          expected_result,
          description,
          actions,
          color_class,
          status,
          created_at
        FROM v_improvement_plans
        ORDER BY phase_number
      `;

      const plans = await client.query(plansQuery);

      // Formatear planes para el frontend
      const formattedPlans = plans.rows.map(plan => ({
        days: plan.estimated_days,
        title: plan.title,
        color: plan.color_class,
        expectedResult: plan.expected_result,
        description: plan.description,
        status: plan.status,
        actions: plan.actions // Ya es JSON desde la vista
      }));

      // Calcular métricas de progreso (simulado por ahora)
      const progressMetrics = {
        total_phases: plans.rows.length,
        total_days: plans.rows.reduce((sum, p) => sum + p.estimated_days, 0),
        phases_completed: 0, // Se actualizaría basado en estado real
        estimated_tir_improvement: 2.7, // Suma de mejoras esperadas
        total_actions: plans.rows.reduce((sum, p) => sum + p.actions.length, 0)
      };

      // Timeline de implementación
      let cumulativeDays = 0;
      const timeline = plans.rows.map(plan => {
        const startDay = cumulativeDays;
        cumulativeDays += plan.estimated_days;
        
        return {
          phase: plan.phase_number,
          title: plan.title,
          start_day: startDay,
          end_day: cumulativeDays,
          duration: plan.estimated_days,
          status: plan.status
        };
      });

      // Recursos de aprendizaje recomendados
      const learningResources = [
        {
          title: 'Menu Engineering',
          description: 'Optimiza tu menú por rentabilidad con análisis ABC y estrategias de pricing.',
          category: 'Costos',
          duration: '5 min lectura',
          icon: '📊',
          gradient: 'from-purple-400 to-purple-600'
        },
        {
          title: 'Gestión de Proveedores',
          description: 'Técnicas de negociación y evaluación para reducir costos de adquisición.',
          category: 'Negociación',
          duration: '8 min lectura',
          icon: '🤝',
          gradient: 'from-gray-400 to-gray-600'
        },
        {
          title: 'Lean Management',
          description: 'Elimina desperdicios y mejora la eficiencia operativa de tu restaurante.',
          category: 'Operaciones',
          duration: '6 min lectura',
          icon: '⚡',
          gradient: 'from-gray-400 to-gray-600'
        },
        {
          title: 'Control de Inventarios',
          description: 'Implementa sistemas FIFO y predicción de demanda para optimizar rotación.',
          category: 'Inventario',
          duration: '7 min lectura',
          icon: '📦',
          gradient: 'from-purple-300 to-purple-500'
        }
      ];

      return {
        plans: formattedPlans,
        metrics: progressMetrics,
        timeline,
        learningResources
      };

    }, event);

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error en improvement plans:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor',
      message: 'No se pudieron obtener los planes de mejora'
    });
  }
});