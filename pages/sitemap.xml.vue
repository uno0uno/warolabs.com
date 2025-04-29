<script setup>
// Obtener rutas desde /api/sitemap
let routes = [];
try {
  routes = await $fetch('/api/sitemap');
} catch (error) {
  console.error('Error fetching /api/sitemap:', error);
  routes = [
    { loc: '/', lastmod: '2025-04-29', changefreq: 'daily', priority: 1.0 },
    { loc: '/about', lastmod: '2025-04-29', changefreq: 'monthly', priority: 0.8 },
    { loc: '/noticias', lastmod: '2025-04-29', changefreq: 'daily', priority: 0.8 }
  ];
}

// Opcional: Agregar rutas dinámicas desde un endpoint
// if (process.env.NUXT_API_KEY) {
//   const articles = await $fetch('/api/getUrlsSitemap', {
//     headers: { Authorization: `Bearer ${process.env.NUXT_API_KEY}` }
//   });
//   routes.push(...articles.map(p => ({
//     loc: `/noticias/${p.slug}-PUB${p.id}`,
//     lastmod: new Date(p.created_at).toISOString().split('T')[0],
//     changefreq: 'daily',
//     priority: 0.8
//   })));
// }

// Generar XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> ${routes.map(route => ` <url> <loc>https://warolabs.com${route.loc}</loc> <lastmod>${route.lastmod}</lastmod> <changefreq>${route.changefreq}</changefreq> <priority>${route.priority}</priority> </url>`).join('')} </urlset>`;
// Configurar headers para que sea tratado como XML
useHead({
meta: [
{ 'content-type': 'application/xml' }
]
});
</script>

<template> 

<div v-html="xml"></div> 

</template>