// server/routes/sitemap.xml.ts
// GET /sitemap.xml -> XML válido con /, /blog y /blog/<slug> de los artículos publicados del tenant.

import { defineEventHandler, setResponseHeader } from 'h3';
import { withPostgresClient } from '../utils/basedataSettings/withPostgresClient';
import { WAROLABS_TENANT_ID } from '../utils/blog/tenant';

interface ArticleRow {
  slug: string;
  updated_at: string | Date | null;
  created_at: string | Date | null;
}

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

function toISODate(value: string | Date | null | undefined): string {
  if (!value) return new Date().toISOString().split('T')[0];
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  return d.toISOString().split('T')[0];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public?.siteUrl as string | undefined) || 'https://warolabs.com';
  const today = toISODate(null);

  let blogUrls: SitemapUrl[] = [];
  let latestBlogDate = today;

  try {
    const articles = await withPostgresClient(async (client) => {
      const result = await client.query<ArticleRow>(
        `SELECT slug, updated_at, created_at
         FROM public.articles
         WHERE tenant_id = $1
           AND published = true
           AND is_active = true
           AND draft = false
         ORDER BY created_at DESC`,
        [WAROLABS_TENANT_ID]
      );
      return result.rows;
    }, event);

    if (articles.length > 0) {
      const timestamps = articles
        .map((a) => new Date((a.updated_at as string) || (a.created_at as string)).getTime())
        .filter((t) => Number.isFinite(t));
      if (timestamps.length > 0) {
        latestBlogDate = new Date(Math.max(...timestamps)).toISOString().split('T')[0];
      }
      blogUrls = articles.map((a) => ({
        loc: `/blog/${a.slug}`,
        lastmod: toISODate(a.updated_at || a.created_at),
        changefreq: 'weekly',
        priority: '0.8',
      }));
    }
  } catch (error) {
    console.error('[sitemap] error fetching articles:', error instanceof Error ? error.message : String(error));
  }

  const baseUrls: SitemapUrl[] = [
    { loc: '/', lastmod: today, changefreq: 'daily', priority: '1.0' },
    { loc: '/blog', lastmod: latestBlogDate, changefreq: 'daily', priority: '0.9' },
  ];

  const allUrls = [...baseUrls, ...blogUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(`${siteUrl}${url.loc}`)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  setResponseHeader(event, 'Cache-Control', 'max-age=3600, s-maxage=3600');

  return xml;
});
