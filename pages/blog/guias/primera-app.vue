<template>
  <article class="prose prose-lg max-w-none">
    <!-- Breadcrumbs -->
    <Breadcrumbs :crumbs="breadcrumbs" />

    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-main mb-4">Crear tu primera app</h1>
      <p class="text-base text-text-body">
        Tutorial paso a paso para crear tu primera aplicación con Warolabs.
      </p>
    </div>

    <!-- Content -->
    <section class="mb-8">
      <h2 id="introduccion" class="text-2xl font-semibold text-main mb-4 group cursor-pointer flex items-center gap-2">
        <span class="text-accent opacity-0 group-hover:opacity-100 transition -ml-6 w-6">#</span>
        Introducción
      </h2>
      <p class="text-text-body mb-4">
        En este tutorial, aprenderás a crear una aplicación completa desde cero usando Warolabs.
        Cubriremos todo el proceso, desde la inicialización hasta el despliegue.
      </p>

      <!-- Info box -->
      <CalloutBox variant="info" title="Tiempo estimado">
        30 minutos para completar este tutorial.
      </CalloutBox>
    </section>

    <section class="mb-8">
      <h2 id="paso-1-inicializar" class="text-2xl font-semibold text-main mb-4">
        Paso 1: Inicializar el proyecto
      </h2>
      <p class="text-text-body mb-4">
        Comienza creando un nuevo proyecto con la CLI:
      </p>

      <div class="bg-surface border border-glass-border rounded-lg p-4 my-6 overflow-x-auto">
        <pre class="text-sm text-text-body"><code>npx @warolabs/cli init mi-primera-app
cd mi-primera-app</code></pre>
      </div>

      <p class="text-text-body mb-4">
        La CLI te guiará a través de algunas preguntas para configurar tu proyecto:
      </p>

      <ul class="list-disc list-inside space-y-2 text-text-body mb-4">
        <li>Nombre del proyecto</li>
        <li>Framework preferido (Vue, React, etc.)</li>
        <li>Características adicionales (TypeScript, ESLint, etc.)</li>
      </ul>
    </section>

    <section class="mb-8">
      <h2 id="paso-2-estructura" class="text-2xl font-semibold text-main mb-4 group cursor-pointer flex items-center gap-2">
        <span class="text-accent opacity-0 group-hover:opacity-100 transition -ml-6 w-6">#</span>
        Automatización y Convenciones
      </h2>
      <p class="text-text-body mb-6">
        Warolabs automatiza muchas tareas comunes y sigue convenciones para hacer tu desarrollo más rápido.
      </p>

      <div class="grid sm:grid-cols-2 gap-4 mt-6">
        <FeatureCard icon="📂" title="Enrutamiento">
          Define rutas basadas en la estructura de tu directorio <code class="bg-body border border-glass-border px-1 py-0.5 rounded text-xs text-main">pages/</code>.
        </FeatureCard>

        <FeatureCard icon="⚡" title="Code Splitting">
          Warolabs divide automáticamente tu código en fragmentos pequeños para cargas rápidas.
        </FeatureCard>

        <FeatureCard icon="🔧" title="Auto-imports">
          Componentes y composables se importan automáticamente cuando los usas.
        </FeatureCard>

        <FeatureCard icon="🎨" title="Layouts">
          Crea layouts reutilizables para diferentes secciones de tu app.
        </FeatureCard>
      </div>
    </section>

    <section class="mb-8">
      <h2 id="paso-3-desarrollo" class="text-2xl font-semibold text-main mb-4 group cursor-pointer flex items-center gap-2">
        <span class="text-accent opacity-0 group-hover:opacity-100 transition -ml-6 w-6">#</span>
        Iniciar el servidor de desarrollo
      </h2>
      <p class="text-text-body mb-4">
        Inicia el servidor de desarrollo para ver tu aplicación en acción:
      </p>

      <div class="bg-surface border border-glass-border rounded-lg p-4 my-6 overflow-x-auto">
        <pre class="text-sm text-text-body"><code>npm run dev</code></pre>
      </div>

      <p class="text-text-body mb-4">
        Abre tu navegador en <code>http://localhost:3000</code> y verás tu aplicación corriendo.
      </p>

      <!-- Success callout -->
      <CalloutBox variant="success" title="¡Perfecto!">
        Tu servidor de desarrollo está corriendo. Los cambios se reflejarán automáticamente.
      </CalloutBox>
    </section>

    <section class="mb-8">
      <h2 id="paso-4-primer-componente" class="text-2xl font-semibold text-main mb-4">
        Paso 4: Crear tu primer componente
      </h2>
      <p class="text-text-body mb-4">
        Crea un componente simple en <code>src/components/Hello.vue</code>:
      </p>

      <div class="bg-surface border border-glass-border rounded-lg p-4 my-6 overflow-x-auto">
        <pre class="text-sm text-text-body"><code>&lt;template&gt;
  &lt;div class="hello"&gt;
    &lt;h1&gt;{{ message }}&lt;/h1&gt;
    &lt;button @click="count++"&gt;
      Clicks: {{ count }}
    &lt;/button&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref } from 'vue'

const message = ref('¡Hola Mundo!')
const count = ref(0)
&lt;/script&gt;</code></pre>
      </div>

      <h3 id="usar-componente" class="text-xl font-medium text-main mb-3">
        Usar el componente
      </h3>
      <p class="text-text-body mb-4">
        Importa y usa tu componente en cualquier página:
      </p>

      <div class="bg-surface border border-glass-border rounded-lg p-4 my-6 overflow-x-auto">
        <pre class="text-sm text-text-body"><code>&lt;template&gt;
  &lt;div&gt;
    &lt;Hello /&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup&gt;
import Hello from '@/components/Hello.vue'
&lt;/script&gt;</code></pre>
      </div>
    </section>

    <section class="mb-8">
      <h2 id="siguientes-pasos" class="text-2xl font-semibold text-main mb-4">
        Siguientes pasos
      </h2>
      <p class="text-text-body mb-4">
        ¡Felicitaciones! Has creado tu primera aplicación con Warolabs. Ahora puedes:
      </p>

      <div class="grid gap-4 my-6">
        <NuxtLink
          to="/blog/guias/estado"
          class="block p-4 bg-surface border border-glass-border rounded-lg hover:border-accent transition-colors"
        >
          <h4 class="font-medium text-main mb-2">Aprender sobre manejo de estado</h4>
          <p class="text-sm text-text-body">Gestiona el estado de tu aplicación eficientemente</p>
        </NuxtLink>
        <NuxtLink
          to="/blog/guias/rutas"
          class="block p-4 bg-surface border border-glass-border rounded-lg hover:border-accent transition-colors"
        >
          <h4 class="font-medium text-main mb-2">Configurar rutas</h4>
          <p class="text-sm text-text-body">Crea navegación entre páginas</p>
        </NuxtLink>
      </div>
    </section>

    <!-- Navigation -->
    <div class="mt-12 pt-6 border-t border-glass-border flex items-center justify-between">
      <div>
        <p class="text-sm text-secondary mb-1">Anterior</p>
        <NuxtLink to="/blog/configuracion" class="text-accent hover:underline font-medium">
          ← Configuración
        </NuxtLink>
      </div>
      <div class="text-right">
        <p class="text-sm text-secondary mb-1">Siguiente</p>
        <NuxtLink to="/blog/guias/estado" class="text-accent hover:underline font-medium">
          Manejo de estado →
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup>
const breadcrumbs = [
  { label: 'Docs', path: '/blog' },
  { label: 'Guías', path: '/blog' },
  { label: 'Crear tu primera app', path: '/blog/guias/primera-app' }
]

definePageMeta({
  layout: 'blog'
})

useHead({
  title: 'Crear tu primera app - Warolabs Docs',
  meta: [
    { name: 'description', content: 'Tutorial para crear tu primera aplicación con Warolabs' }
  ]
})
</script>
