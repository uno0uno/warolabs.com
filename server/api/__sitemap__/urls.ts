import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  // URLs estáticas del sitio
  const staticUrls = [
    {
      loc: '/',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: '/blog',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.9
    }
  ]

  // Aquí puedes agregar URLs dinámicas desde la base de datos
  // Por ejemplo, artículos del blog:
  // const articles = await fetchArticlesFromDB()
  // const articleUrls = articles.map(article => ({
  //   loc: `/blog/${article.slug}`,
  //   lastmod: article.updated_at,
  //   changefreq: 'weekly',
  //   priority: 0.8
  // }))

  return [
    ...staticUrls
    // ...articleUrls
  ]
})
