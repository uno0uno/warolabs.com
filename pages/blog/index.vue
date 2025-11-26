<template>
  <article class="prose prose-lg max-w-none">
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-main mb-4">Introducción a Warolabs</h1>
      <p class="text-base text-text-body">
        Bienvenido a la documentación de Warolabs. Aquí aprenderás todo lo necesario para empezar a construir con nuestras herramientas.
      </p>
    </div>

    <!-- Content with proper headings for TOC -->
    <section class="mb-8">
      <h2 id="que-es-warolabs" class="text-2xl font-semibold text-main mb-4">
        ¿Qué es Warolabs?
      </h2>
      <p class="text-text-body mb-4">
        Warolabs es una plataforma diseñada para democratizar el acceso a la tecnología y la inteligencia artificial.
        Ofrecemos workshops virtuales, eventos educativos y recursos para desarrolladores de habla hispana.
      </p>
      <p class="text-text-body mb-4">
        Nuestra misión es hacer que la tecnología sea accesible para todos, independientemente de tu nivel de experiencia
        o conocimientos previos.
      </p>

      <!-- Info callout -->
      <div class="bg-glass border border-glass-border rounded-lg p-4 my-6">
        <div class="flex gap-3">
          <InformationCircleIcon class="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm text-text-body">
              <strong class="text-main">Nota:</strong> Esta es una documentación de ejemplo para demostrar
              el diseño estilo GitBook.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="mb-8">
      <h2 id="caracteristicas-principales" class="text-2xl font-semibold text-main mb-4">
        Características principales
      </h2>

      <h3 id="eventos-virtuales" class="text-lg font-medium text-main mb-3">
        Eventos virtuales
      </h3>
      <p class="text-text-body mb-4">
        Organizamos eventos educativos regulares sobre temas de tecnología, IA y desarrollo de software.
      </p>

      <h3 id="workshops-practicos" class="text-lg font-medium text-main mb-3">
        Workshops prácticos
      </h3>
      <p class="text-text-body mb-4">
        Aprende haciendo con nuestros workshops hands-on que te guían paso a paso en la construcción de proyectos reales.
      </p>

      <h3 id="comunidad" class="text-lg font-medium text-main mb-3">
        Comunidad
      </h3>
      <p class="text-text-body mb-4">
        Conecta con otros desarrolladores y entusiastas de la tecnología en nuestra comunidad activa.
      </p>
    </section>

    <section class="mb-8">
      <h2 id="primeros-pasos" class="text-2xl font-semibold text-main mb-4">
        Primeros pasos
      </h2>
      <p class="text-text-body mb-4">
        Para comenzar tu viaje con Warolabs, te recomendamos seguir estos pasos:
      </p>

      <ol class="list-decimal list-inside space-y-2 text-text-body mb-4">
        <li>Lee la guía de <NuxtLink to="/blog/instalacion" class="text-accent hover:underline">instalación</NuxtLink></li>
        <li>Configura tu entorno siguiendo la <NuxtLink to="/blog/configuracion" class="text-accent hover:underline">guía de configuración</NuxtLink></li>
        <li>Crea tu primera aplicación con nuestro <NuxtLink to="/blog/guias/primera-app" class="text-accent hover:underline">tutorial paso a paso</NuxtLink></li>
      </ol>

      <!-- Code example -->
      <div class="bg-surface border border-glass-border rounded-lg p-4 my-6 overflow-x-auto">
        <pre class="text-sm text-text-body"><code>// Ejemplo de código
npm install @warolabs/cli
npx warolabs init mi-proyecto
cd mi-proyecto
npm run dev</code></pre>
      </div>
    </section>

    <section class="mb-8">
      <h2 id="recursos-adicionales" class="text-2xl font-semibold text-main mb-4">
        Recursos adicionales
      </h2>
      <p class="text-text-body mb-4">
        Explora estos recursos para profundizar en diferentes aspectos de la plataforma:
      </p>

      <div class="grid gap-4 my-6">
        <a href="#" class="block p-4 bg-surface border border-glass-border rounded-lg hover:border-accent transition-colors">
          <h4 class="font-medium text-main mb-2">Guías completas</h4>
          <p class="text-sm text-text-body">Tutoriales detallados sobre diferentes temas</p>
        </a>
        <a href="#" class="block p-4 bg-surface border border-glass-border rounded-lg hover:border-accent transition-colors">
          <h4 class="font-medium text-main mb-2">Referencia de API</h4>
          <p class="text-sm text-text-body">Documentación completa de todas las APIs disponibles</p>
        </a>
        <a href="#" class="block p-4 bg-surface border border-glass-border rounded-lg hover:border-accent transition-colors">
          <h4 class="font-medium text-main mb-2">Ejemplos y plantillas</h4>
          <p class="text-sm text-text-body">Proyectos de ejemplo para comenzar rápidamente</p>
        </a>
      </div>
    </section>

    <!-- Next steps -->
    <div class="mt-12 pt-6 border-t border-glass-border flex items-center justify-between">
      <div>
        <p class="text-sm text-secondary mb-1">Siguiente</p>
        <NuxtLink to="/blog/instalacion" class="text-accent hover:underline font-medium">
          Instalación →
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup>
import { InformationCircleIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'blog'
})

useHead({
  title: 'Introducción - Warolabs Docs',
  meta: [
    { name: 'description', content: 'Documentación oficial de Warolabs' }
  ]
})
</script>

<style scoped>
/* Custom prose styles */
article :deep(a) {
  @apply text-accent hover:underline;
}

article :deep(code) {
  @apply bg-surface px-1.5 py-0.5 rounded text-sm;
}
</style>
