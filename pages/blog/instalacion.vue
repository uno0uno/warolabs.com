<template>
  <article class="prose prose-lg max-w-none">
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-main mb-4">Instalación</h1>
      <p class="text-lg text-text-body">
        Aprende cómo instalar y configurar Warolabs en tu entorno de desarrollo.
      </p>
    </div>

    <!-- Content -->
    <section class="mb-8">
      <h2 id="requisitos-previos" class="text-2xl font-semibold text-main mb-4">
        Requisitos previos
      </h2>
      <p class="text-text-body mb-4">
        Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:
      </p>

      <ul class="list-disc list-inside space-y-2 text-text-body mb-4">
        <li>Node.js versión 18 o superior</li>
        <li>npm o yarn como gestor de paquetes</li>
        <li>Git para control de versiones</li>
      </ul>

      <!-- Warning callout -->
      <div class="bg-glass border-l-4 border-accent rounded-lg p-4 my-6">
        <div class="flex gap-3">
          <ExclamationTriangleIcon class="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm text-text-body">
              <strong class="text-main">Importante:</strong> Asegúrate de tener Node.js 18+ instalado.
              Versiones anteriores no son compatibles.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="mb-8">
      <h2 id="instalacion-global" class="text-2xl font-semibold text-main mb-4">
        Instalación global
      </h2>
      <p class="text-text-body mb-4">
        Puedes instalar la CLI de Warolabs globalmente usando npm:
      </p>

      <div class="bg-surface border border-glass-border rounded-lg p-4 my-6 overflow-x-auto">
        <pre class="text-sm text-text-body"><code>npm install -g @warolabs/cli</code></pre>
      </div>

      <h3 id="verificar-instalacion" class="text-xl font-medium text-main mb-3">
        Verificar la instalación
      </h3>
      <p class="text-text-body mb-4">
        Una vez instalado, verifica que todo funcione correctamente:
      </p>

      <div class="bg-surface border border-glass-border rounded-lg p-4 my-6 overflow-x-auto">
        <pre class="text-sm text-text-body"><code>warolabs --version
# Debería mostrar: @warolabs/cli v1.0.0</code></pre>
      </div>
    </section>

    <section class="mb-8">
      <h2 id="instalacion-por-proyecto" class="text-2xl font-semibold text-main mb-4">
        Instalación por proyecto
      </h2>
      <p class="text-text-body mb-4">
        Si prefieres instalarlo solo para un proyecto específico:
      </p>

      <div class="bg-surface border border-glass-border rounded-lg p-4 my-6 overflow-x-auto">
        <pre class="text-sm text-text-body"><code>npm install --save-dev @warolabs/cli</code></pre>
      </div>

      <h3 id="ejecutar-con-npx" class="text-xl font-medium text-main mb-3">
        Ejecutar con npx
      </h3>
      <p class="text-text-body mb-4">
        También puedes usar npx sin necesidad de instalar:
      </p>

      <div class="bg-surface border border-glass-border rounded-lg p-4 my-6 overflow-x-auto">
        <pre class="text-sm text-text-body"><code>npx @warolabs/cli init mi-proyecto</code></pre>
      </div>
    </section>

    <section class="mb-8">
      <h2 id="solucion-de-problemas" class="text-2xl font-semibold text-main mb-4">
        Solución de problemas
      </h2>

      <h3 id="error-permisos" class="text-xl font-medium text-main mb-3">
        Error de permisos
      </h3>
      <p class="text-text-body mb-4">
        Si encuentras problemas de permisos al instalar globalmente, usa:
      </p>

      <div class="bg-surface border border-glass-border rounded-lg p-4 my-6 overflow-x-auto">
        <pre class="text-sm text-text-body"><code>sudo npm install -g @warolabs/cli</code></pre>
      </div>

      <h3 id="version-node" class="text-xl font-medium text-main mb-3">
        Versión de Node.js incompatible
      </h3>
      <p class="text-text-body mb-4">
        Si tienes una versión antigua de Node.js, actualízala usando nvm:
      </p>

      <div class="bg-surface border border-glass-border rounded-lg p-4 my-6 overflow-x-auto">
        <pre class="text-sm text-text-body"><code>nvm install 18
nvm use 18</code></pre>
      </div>
    </section>

    <!-- Navigation -->
    <div class="mt-12 pt-6 border-t border-glass-border flex items-center justify-between">
      <div>
        <p class="text-sm text-secondary mb-1">Anterior</p>
        <NuxtLink to="/blog" class="text-accent hover:underline font-medium">
          ← Introducción
        </NuxtLink>
      </div>
      <div class="text-right">
        <p class="text-sm text-secondary mb-1">Siguiente</p>
        <NuxtLink to="/blog/configuracion" class="text-accent hover:underline font-medium">
          Configuración →
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'blog'
})

useHead({
  title: 'Instalación - Warolabs Docs',
  meta: [
    { name: 'description', content: 'Guía de instalación de Warolabs CLI' }
  ]
})
</script>
