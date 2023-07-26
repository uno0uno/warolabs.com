//server/api/_sitemap-urls.ts
export default defineEventHandler(async () => {
  const [discotecas,articulos,promociones] = await Promise.all([
    $fetch('/api/sitemaps/discotecas'),
    $fetch('/api/sitemaps/articulos'),
    $fetch('/api/sitemaps/promociones'),
  ]);
  return [...discotecas,...articulos,...promociones].map((p) => {
    return {
      loc: p.slugId,
      changefreq: 'daily',
      priority: 0.8,
    };
  });
});