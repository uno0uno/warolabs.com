// server/api/blog/[slug].get.ts
// GET /api/blog/[slug] -> 200 {article, author, tenant, related} | 404
// Wrapper de get_article_by_slug + get_related_articles.

import { defineEventHandler, getRouterParam, createError } from 'h3';
import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';
import { WAROLABS_TENANT_ID } from '~/server/utils/blog/tenant';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug || typeof slug !== 'string' || slug.length === 0 || slug.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid slug' });
  }

  return withPostgresClient(async (client) => {
    try {
      const articleResult = await client.query(
        'SELECT * FROM public.get_article_by_slug($1, $2, $3)',
        [WAROLABS_TENANT_ID, slug, true]
      );

      if (articleResult.rows.length === 0) {
        throw createError({ statusCode: 404, statusMessage: 'Article not found' });
      }

      const row = articleResult.rows[0];

      // Fetch related articles (3 by default)
      const relatedResult = await client.query(
        'SELECT * FROM public.get_related_articles($1, $2, $3, $4)',
        [WAROLABS_TENANT_ID, row.id, row.tags ?? '', 3]
      );

      const related = relatedResult.rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        description: r.description,
        cover: r.cover,
        thumbnail: r.thumbnail,
        tags: r.tags ? r.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        pillar: r.pillar,
        publishedAt: r.published_at,
        views: r.views ? Number(r.views) : 0,
        author: {
          id: r.author_id,
          name: r.author_name,
          avatar: r.author_avatar,
        },
      }));

      return {
        article: {
          id: row.id,
          slug: row.slug,
          title: row.title,
          description: row.description,
          content: row.content,
          cover: row.cover,
          thumbnail: row.thumbnail,
          tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
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
      console.error('[api/blog/[slug]] error:', error);
      throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
    }
  });
});
