import { defineEventHandler } from 'h3';
// RUTA CORREGIDA: ../../ en lugar de ../
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  return withPostgresClient(async (client) => {
    try {
      const query = `
        SELECT
          t.id AS tenant_id,
          t.name AS tenant_name,
          t.slug AS tenant_slug,
          COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'profile_id', p.id,
                'name', p.name,
                'email', p.email
              )
            )
            FROM public.tenant_members tm
            JOIN public.profile p ON tm.user_id = p.id
            WHERE tm.tenant_id = t.id),
            '[]'::jsonb
          ) AS members
        FROM public.tenants t
        GROUP BY t.id
        ORDER BY t.name;
      `;

      const result = await client.query(query);

      return {
        success: true,
        data: result.rows,
      };

    } catch (error) {
      console.error("Error fetching tenants and members:", error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error'
      });
    }
  });
});