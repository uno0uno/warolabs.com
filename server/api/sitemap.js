// server\api\sitemap.js

export default defineEventHandler(() => {
    return [
      { loc: '/', lastmod: '2025-04-29', changefreq: 'daily', priority: 1.0 },
      { loc: '/about', lastmod: '2025-04-29', changefreq: 'monthly', priority: 0.8 }
    ]
  })