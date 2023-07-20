//server/api/_sitemap-urls.ts
export default cachedEventHandler(
    async (e) => {
      const posts = await Promise.all([
        {
          _path: '/blog/post-a',
          modifiedAt: new Date(),
        },
        {
          _path: '/blog/post-b',
          modifiedAt: new Date(),
        },
        {
          _path: '/blog/post-c',
          modifiedAt: new Date(),
        },
      ]);
      return posts.map((p) => {
        return {
          loc: p._path,
          lastmod: p.modifiedAt,
        };
      });
    },
    {
      name: 'sitemap-dynamic-url',
      maxAge: 60 * 10, // cache URLs for 10 minutes
    }
  );
  