// server/api/blog/[slug].get.ts
// GET /api/blog/[slug] -> 200 {article, author, tenant, related} | 404
// READ-ONLY: el increment de views se hace via POST /api/blog/[slug]/view.

import { defineEventHandler, getRouterParam, createError } from 'h3';
import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';
import { WAROLABS_TENANT_ID } from '~/server/utils/blog/tenant';

const SLUG_REGEX = /^[a-z0-9-]{1,200}$/;

function normalizeArticleSummary(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    cover: row.cover,
    thumbnail: row.thumbnail,
    tags: typeof row.tags === 'string' && row.tags.length > 0
      ? row.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [],
    pillar: row.pillar,
    publishedAt: row.published_at,
    views: row.views ? Number(row.views) : 0,
    author: {
      id: row.author_id,
      name: row.author_name,
      avatar: row.author_avatar,
    },
  };
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug || typeof slug !== 'string' || !SLUG_REGEX.test(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid slug' });
  }

  return withPostgresClient(async (client) => {
    try {
      const articleResult = await client.query(
        'SELECT * FROM public.get_article_by_slug($1, $2)',
        [WAROLABS_TENANT_ID, slug]
      );

      if (articleResult.rows.length === 0) {
        throw createError({ statusCode: 404, statusMessage: 'Article not found' });
      }

      const row = articleResult.rows[0];

      const relatedResult = await client.query(
        'SELECT * FROM public.get_related_articles($1, $2, $3, $4)',
        [WAROLABS_TENANT_ID, row.id, row.tags ?? '', 3]
      );

      const related = relatedResult.rows.map(normalizeArticleSummary);

      return {
        article: {
          id: row.id,
          slug: row.slug,
          title: row.title,
          description: row.description,
          content: row.content,
          cover: row.cover,
          thumbnail: row.thumbnail,
          tags: typeof row.tags === 'string' && row.tags.length > 0
            ? row.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
            : [],
          pillar: row.pillar,
          metaTitle: row.meta_title,
          metaDescription: row.meta_descripcion,
          views: row.views ? Number(row.views) : 0,
          publishedAt: row.published_at,
          updatedAt: row.updated_at,
        },
        author: {
          id: row.author_id,
          name: row.author_name,
          email: row.author_email,
          avatar: row.author_avatar,
          userName: row.author_user_name,
        },
        tenant: {
          name: row.tenant_name,
        },
        related,
      };
    } catch (error: any) {
      if (error?.statusCode === 404) throw error;
      console.error('[api/blog/[slug]] error:', error instanceof Error ? error.message : String(error));
      throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
    }
  });
});
