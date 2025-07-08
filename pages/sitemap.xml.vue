<script setup>
// Obtener rutas desde /api/sitemap



definePageMeta({
  layout: 'noLayout',
});

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

// Generar tabla HTML con las rutas
const tableHtml = `
<table class="table-auto w-full border-collapse border border-gray-300 mt-5">
    <thead class="bg-gray-100">
        <tr>
            <th class="border border-gray-300 px-4 py-2 text-left">Nombre del Sitio</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Última Modificación</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Frecuencia de Cambio</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Prioridad</th>
        </tr>
    </thead>
    <tbody>
        ${routes.map((route, index) => `
        <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100">
            <td class="border border-gray-300 px-4 py-2">
                <a href="https://warolabs.com${route.loc}" target="_blank" class="text-blue-600 hover:underline">${route.loc}</a>
            </td>
            <td class="border border-gray-300 px-4 py-2">${route.lastmod}</td>
            <td class="border border-gray-300 px-4 py-2">${route.changefreq}</td>
            <td class="border border-gray-300 px-4 py-2">${route.priority}</td>
        </tr>`).join('')}
    </tbody>
</table>`;
</script>

<template>
    <div class="p-5 bg-gray-50 border border-gray-300 rounded-lg">
        <h1 class="text-2xl font-bold mb-4">Sitemap de Warolabs</h1>
        <div v-html="tableHtml" class="overflow-x-auto"></div>
    </div>
</template>

<style scoped></style>