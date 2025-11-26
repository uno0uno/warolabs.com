<template>
  <nav class="py-6 px-4">
    <!-- Navigation sections -->
    <div class="space-y-6">
      <div v-for="section in navigation" :key="section.title">
        <!-- Section header with icon -->
        <div class="flex items-center gap-2 mb-2 text-main">
          <div class="text-accent">
            <component :is="section.icon" class="h-4 w-4" />
          </div>
          <h5 class="font-semibold tracking-wide text-xs uppercase">{{ section.title }}</h5>
        </div>
        
        <!-- Section pages with border-left style aligned to icon center -->
        <ul class="space-y-0.5 border-l border-glass-border ml-[7.5px] pl-4">
          <li v-for="page in section.pages" :key="page.path">
            <NuxtLink
              :to="page.path"
              :class="[
                'block py-1 text-sm transition-colors pl-3',
                isActivePage(page.path)
                  ? 'text-accent font-medium -ml-[1px] border-l-2 border-accent'
                  : 'text-secondary hover:text-main'
              ]"
              @click="$emit('navigate')"
            >
              {{ page.title }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { BoltIcon, CubeIcon, CodeBracketIcon, BookOpenIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits(['navigate'])
const route = useRoute()

// Navigation structure with icons
const navigation = [
  {
    title: 'Primeros pasos',
    icon: BoltIcon,
    pages: [
      { title: 'Introducción', path: '/blog' },
      { title: 'Instalación', path: '/blog/instalacion' },
      { title: 'Configuración', path: '/blog/configuracion' },
    ]
  },
  {
    title: 'Guías',
    icon: BookOpenIcon,
    pages: [
      { title: 'Crear tu primera app', path: '/blog/guias/primera-app' },
      { title: 'Manejo de estado', path: '/blog/guias/estado' },
      { title: 'Rutas y navegación', path: '/blog/guias/rutas' },
    ]
  },
  {
    title: 'API',
    icon: CodeBracketIcon,
    pages: [
      { title: 'Referencia de API', path: '/blog/api/referencia' },
      { title: 'Endpoints', path: '/blog/api/endpoints' },
      { title: 'Autenticación', path: '/blog/api/auth' },
    ]
  },
  {
    title: 'Recursos',
    icon: CubeIcon,
    pages: [
      { title: 'Mejores prácticas', path: '/blog/recursos/mejores-practicas' },
      { title: 'FAQ', path: '/blog/recursos/faq' },
      { title: 'Comunidad', path: '/blog/recursos/comunidad' },
    ]
  },
]

const isActivePage = (path) => {
  return route.path === path
}
</script>
