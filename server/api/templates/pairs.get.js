import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;
  return await withPostgresClient(async (client) => {
    try {
      if (tenantContext.is_superuser) {
        console.log(`🔓 Superuser obteniendo todos los pares de templates`);
      } else {
        console.log(`🔐 Obteniendo pares de templates para usuario: ${tenantContext.user_id}`);
      }
      
      let baseQuery = `
        SELECT 
          t.pair_id,
          -- Obtener el nombre base del par (sin " - Email" o " - Landing")
          REGEXP_REPLACE(MIN(t.template_name), ' - (Email|Landing)$', '') as pair_name,
          MIN(t.description) as description,
          MIN(t.created_at) as created_at,
          MIN(t.sender_email) as sender_email,
          -- Obtener información de ambos templates del par
          json_agg(
            json_build_object(
              'id', t.id,
              'type', t.template_type,
              'name', t.template_name,
              'subject_template', t.subject_template
            ) ORDER BY t.template_type ASC
          ) as templates,
          COUNT(*) as template_count
        FROM templates t
        WHERE t.pair_id IS NOT NULL AND t.is_deleted = false
      `;

      let params = [];
      
      if (!tenantContext.is_superuser) {
        baseQuery += ` AND t.created_by_profile_id = $1`;
        params.push(tenantContext.user_id);
      }
      
      baseQuery += `
        GROUP BY t.pair_id
        HAVING COUNT(*) = 2  -- Solo pares completos
        ORDER BY MIN(t.created_at) DESC
      `;

      const result = await client.query(baseQuery, params);
      console.log(`📋 [API] Found ${result.rows.length} template pairs`);
      
      // Formatear los resultados
      const pairs = result.rows.map(row => ({
        pair_id: row.pair_id,
        name: row.pair_name,
        description: row.description,
        created_at: row.created_at,
        sender_email: row.sender_email,
        templates: row.templates,
        email_template: row.templates.find(t => t.template_type === 'email'),
        landing_template: row.templates.find(t => t.template_type === 'landing'),
        is_complete: parseInt(row.template_count) === 2
      }));

      return {
        success: true,
        data: pairs
      };

    } catch (error) {
      console.error('❌ [API] Error fetching template pairs:', error);
      return {
        success: false,
        message: 'Error al obtener los pares de templates',
        error: error.message
      };
    }
  }, event);
});