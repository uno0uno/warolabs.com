// server/api/blog/index.get.ts
// GET /api/blog/index?pillar=&search=&tag=&page= -> {items, total, page, pageSize}
// Wrapper de la PG function list_articles con multi-tenant scope.

import { defineEventHandler, getQuery, createError } from 'h3';
import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';
import { WAROLABS_TENANT_ID, isBlogPillar } from '~/server/utils/blog/tenant';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const pillar = typeof query.pillar === 'string' && isBlogPillar(query.pillar) ? query.pillar : null;
  const search = typeof query.search === 'string' && query.search.trim().length > 0 ? query.search.trim() : null;
  const tag = typeof query.tag === 'string' && query.tag.trim().length > 0 ? query.tag.trim() : null;
  const page = Math.max(1, Number.parseInt(String(query.page ?? '1'), 10) || 1);
  const pageSize = Math.min(60, Math.max(1, Number.parseInt(String(query.pageSize ?? '12'), 10) || 12));

  return withPostgresClient(async (client) => {
    try {
      const result = await client.query(
        'SELECT * FROM public.list_articles($1, $2, $3, $4, $5, $6)',
        [WAROLABS_TENANT_ID, pillar, search, tag, page, pageSize]
      );

      const items = result.rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        cover: row.cover,
        thumbnail: row.thumbnail,
        tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        pillar: row.pillar,
        publishedAt: row.published_at,
        views: row.views ? Number(row.views) : 0,
        author: {
          id: row.author_id,
          name: row.author_name,
          avatar: row.author_avatar,
        },
      }));

      const total = items[0]?.total_count ?? 0;

      return {
        items,
        total: Number(total),
        page,
        pageSize,
        pillar,
        search,
        tag,
      };
    } catch (error) {
      console.error('[api/blog/index] error:', error);
      throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
    }
  });
});
