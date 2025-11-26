<template>
  <article class="prose prose-lg max-w-none">
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-main mb-4">Configuración</h1>
      <p class="text-lg text-text-body">
        Configura tu proyecto de Warolabs para adaptarlo a tus necesidades.
      </p>
    </div>

    <!-- Content -->
    <section class="mb-8">
      <h2 id="archivo-de-configuracion" class="text-2xl font-semibold text-main mb-4">
        Archivo de configuración
      </h2>
      <p class="text-text-body mb-4">
        Warolabs utiliza un archivo <code>warolabs.config.js</code> en la raíz de tu proyecto para
        toda la configuración. Este archivo se genera automáticamente al inicializar un proyecto.
      </p>

      <div class="bg-surface border border-glass-border rounded-lg p-4 my-6 overflow-x-auto">
        <pre class="text-sm text-text-body"><code>// warolabs.config.js
export default {
  // Configuración del proyecto
  name: 'Mi Proyecto',
  version: '1.0.0',

  // Opciones de desarrollo
  dev: {
    port: 3000,
    host: 'localhost'
  },

  // Integraciones
  integrations: {
    analytics: true,
    seo: true
  }
}</code></pre>
      </div>
    </section>

    <section class="mb-8">
      <h2 id="opciones-principales" class="text-2xl font-semibold text-main mb-4">
        Opciones principales
      </h2>

      <h3 id="opciones-basicas" class="text-xl font-medium text-main mb-3">
        Opciones básicas
      </h3>

      <div class="space-y-6 mb-6">
        <div class="bg-glass border border-glass-border rounded-lg p-4">
          <div class="flex items-start gap-3">
            <code class="text-sm text-accent bg-surface px-2 py-1 rounded">name</code>
            <div class="flex-1">
              <p class="text-sm text-text-body">
                El nombre de tu proyecto. Se usa en varios lugares como títulos y metadata.
              </p>
            </div>
          </div>
        </div>

        <div class="bg-glass border border-glass-border rounded-lg p-4">
          <div class="flex items-start gap-3">
            <code class="text-sm text-accent bg-surface px-2 py-1 rounded">version</code>
            <div class="flex-1">
              <p class="text-sm text-text-body">
                La versión de tu proyecto. Sigue el formato semver (ej: 1.0.0).
              </p>
            </div>
          </div>
        </div>
      </div>

      <h3 id="opciones-desarrollo" class="text-xl font-medium text-main mb-3">
        Opciones de desarrollo
      </h3>

      <p class="text-text-body mb-4">
        Personaliza tu entorno de desarrollo:
      </p>

      <div class="bg-surface border border-glass-border rounded-lg p-4 my-6 overflow-x-auto">
        <pre class="text-sm text-text-body"><code>dev: {
  port: 3000,          // Puerto del servidor de desarrollo
  host: 'localhost',   // Host del servidor
  open: true,          // Abrir navegador automáticamente
  https: false         // Usar HTTPS en desarrollo
}</code></pre>
      </div>
    </section>

    <section class="mb-8">
      <h2 id="variables-de-entorno" class="text-2xl font-semibold text-main mb-4">
        Variables de entorno
      </h2>

      <p class="text-text-body mb-4">
        Crea un archivo <code>.env</code> en la raíz de tu proyecto para variables sensibles:
      </p>

      <div class="bg-surface border border-glass-border rounded-lg p-4 my-6 overflow-x-auto">
        <pre class="text-sm text-text-body"><code># .env
DATABASE_URL=postgresql://localhost/mydb
API_KEY=tu-api-key-secreta
ENVIRONMENT=development</code></pre>
      </div>

      <!-- Security callout -->
      <div class="bg-glass border-l-4 border-accent rounded-lg p-4 my-6">
        <div class="flex gap-3">
          <ShieldCheckIcon class="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm text-text-body">
              <strong class="text-main">Seguridad:</strong> Nunca commites archivos .env a tu repositorio.
              Añádelos siempre a .gitignore.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="mb-8">
      <h2 id="integraciones" class="text-2xl font-semibold text-main mb-4">
        Integraciones
      </h2>

      <h3 id="analytics" class="text-xl font-medium text-main mb-3">
        Analytics
      </h3>
      <p class="text-text-body mb-4">
        Habilita el seguimiento de analytics en tu proyecto:
      </p>

      <div class="bg-surface border border-glass-border rounded-lg p-4 my-6 overflow-x-auto">
        <pre class="text-sm text-text-body"><code>integrations: {
  analytics: {
    enabled: true,
    provider: 'google-analytics',
    trackingId: 'GA-XXXXXXX'
  }
}</code></pre>
      </div>

      <h3 id="seo" class="text-xl font-medium text-main mb-3">
        SEO
      </h3>
      <p class="text-text-body mb-4">
        Configura las opciones de SEO para tu sitio:
      </p>

      <div class="bg-surface border border-glass-border rounded-lg p-4 my-6 overflow-x-auto">
        <pre class="text-sm text-text-body"><code>integrations: {
  seo: {
    enabled: true,
    sitemap: true,
    robots: true
  }
}</code></pre>
      </div>
    </section>

    <!-- Navigation -->
    <div class="mt-12 pt-6 border-t border-glass-border flex items-center justify-between">
      <div>
        <p class="text-sm text-secondary mb-1">Anterior</p>
        <NuxtLink to="/blog/instalacion" class="text-accent hover:underline font-medium">
          ← Instalación
        </NuxtLink>
      </div>
      <div class="text-right">
        <p class="text-sm text-secondary mb-1">Siguiente</p>
        <NuxtLink to="/blog/guias/primera-app" class="text-accent hover:underline font-medium">
          Crear tu primera app →
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ShieldCheckIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'blog'
})

useHead({
  title: 'Configuración - Warolabs Docs',
  meta: [
    { name: 'description', content: 'Guía de configuración de Warolabs' }
  ]
})
</script>
