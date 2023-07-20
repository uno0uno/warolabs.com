//server/api/_sitemap-urls.ts
export default defineEventHandler(async () => {
  const [discotecas] = await Promise.all([$fetch('/api/business/discotecas')]);
  return [...discotecas].map((p) => {
    return { loc: `/discotecas/${p.user_name}`, changefreq: 'weekly' };
  });
});
