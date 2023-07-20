//server/api/_sitemap-urls.ts
export default defineEventHandler(async () => {
  const [discotecas] = await Promise.all([$fetch('/api/sitemaps/discotecas')]);
  return [...discotecas].map((p) => {
    return {
      loc: `/discotecas/${p.user_name}`,
      changefreq: 'daily',
      priority: 0.8,
    };
  });
});
