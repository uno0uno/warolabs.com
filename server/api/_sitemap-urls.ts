//server/api/_sitemap-urls.ts
export default cachedEventHandler(
  async () => {
    const [discotecas] = await Promise.all([
      $fetch('/api/sitemaps/discotecas'),
    ]);
    return [...discotecas].map((p) => {
      return {
        loc: `/discotecas/${p.user_name}`,
        changefreq: 'daily',
        priority: 0.8,
      };
    });
  },
  {
    name: 'sitemap-dynamic-url',
    maxAge: 60 * 10, // cache URLs for 10 minutes
  }
);
