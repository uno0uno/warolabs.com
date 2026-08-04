// server/api/blog/categories.get.ts
// GET /api/blog/categories -> {categories: [{pillar, count}]}

import { defineEventHandler, createError } from 'h3';
import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';
import { WAROLABS_TENANT_ID } from '~/server/utils/blog/tenant';

export default defineEventHandler(async () => {
  return withPostgresClient(async (client) => {
    try {
      const result = await client.query(
        'SELECT * FROM public.count_articles_by_pillar($1)',
        [WAROLABS_TENANT_ID]
      );

      return {
        categories: result.rows.map((row) => ({
          pillar: row.pillar,
          count: Number(row.article_count),
        })),
      };
    } catch (error) {
      console.error('[api/blog/categories] error:', error instanceof Error ? error.message : String(error));
      throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
    }
  });
});
