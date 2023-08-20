//server/api/_sitemap-urls.ts
export default defineEventHandler(async () => {
  const [articulos] = await Promise.all([
    $fetch('/api/sitemaps/articulos'),
  ]);
  return [...articulos].map((p) => {
    return {
      loc: p.slugId,
      changefreq: 'daily',
      priority: 0.8,
    };
  });
});