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

// Generar XML con formato legible (indentaciones y saltos de línea)
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> ${routes.map(route => ` <url> <loc>https://warolabs.com${route.loc}</loc> <lastmod>${route.lastmod}</lastmod> <changefreq>${route.changefreq}</changefreq> <priority>${route.priority}</priority> </url>`).join('\n')} </urlset>`;
// Intentar establecer el Content-Type como application/xml
useHead({
    meta: [
        { name: 'content-type', content: 'application/xml' }
    ]
});
</script>

<template>
    <div class="sitemap-container">
        <div v-html="xml" class="sitemap-content"></div>
    </div>
</template>

<style scoped>
.sitemap-container {
    padding: 20px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    color: #333;
    overflow-x: auto;
}

.sitemap-content {
    white-space: pre-wrap;
    font-size: 14px;
    line-height: 1.6;
}
</style>