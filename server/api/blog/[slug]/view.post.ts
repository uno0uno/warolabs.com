// server/api/blog/[slug]/view.post.ts
// POST /api/blog/[slug]/view -> {ok, views}
// Incrementa views con advisory lock (no race). Separado del GET para respetar REST.

import { defineEventHandler, getRouterParam, createError } from 'h3';
import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';
import { WAROLABS_TENANT_ID } from '~/server/utils/blog/tenant';

const SLUG_REGEX = /^[a-z0-9-]{1,200}$/;

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug || typeof slug !== 'string' || !SLUG_REGEX.test(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid slug' });
  }

  return withPostgresClient(async (client) => {
    try {
      const result = await client.query(
        'SELECT public.increment_article_views($1, $2) AS views',
        [WAROLABS_TENANT_ID, slug]
      );

      const views = result.rows[0]?.views;
      if (views === null || views === undefined) {
        throw createError({ statusCode: 404, statusMessage: 'Article not found' });
      }

      return { ok: true, views: Number(views) };
    } catch (error: any) {
      if (error?.statusCode === 404) throw error;
      console.error('[api/blog/[slug]/view] error:', error instanceof Error ? error.message : String(error));
      throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
    }
  });
});
