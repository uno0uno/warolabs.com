<template>
  <article 
    @click="$emit('click')"
    class="flex border-2 border-gray-100 bg-white cursor-pointer hover:shadow-sm overflow-hidden"
  >
    <div class="flex items-start gap-4 p-4 sm:p-6 relative  w-full">
      <div class="flex items-start gap-4">
          <!-- Template icon -->
          <a href="#" class="block shrink-0">
            <div class="size-14 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg class="size-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="templateBadge.icon"/>
              </svg>
            </div>
          </a>

          <!-- Main content -->
          <div class="flex-1 min-w-0">
            <h3 class="font-bold font-principal line-clamp-2">
              <p>{{ truncateText(template.name, 60) }}</p>
            </h3>

            <p class="line-clamp-2 font-principal  text-sm text-gray-700">
              {{ truncateText(template.description || 'Sin descripción disponible para este template', 120) }}
            </p>

            <div class="sm:flex sm:items-center sm:gap-2">
              <p class="hidden sm:block sm:text-xs sm:text-gray-500">
                {{ formatDate(template.created_at) }}
                <span v-if="template.active_version"> • V.{{ template.active_version.version_number }}</span>
              </p>
            </div>

          </div>
        </div>  
          <!-- Badge positioned absolute at bottom right -->
          <div class="absolute bottom-0 right-0">
            <strong :class="templateBadge.class" class="inline-flex items-center gap-1 rounded-tl-xl px-3 py-1.5 text-white">
              <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" :d="templateBadge.icon"/>
              </svg>
              <span class="text-[10px] font-medium sm:text-xs">{{ templateBadge.label }}</span>
            </strong>
          </div>
      </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  template: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES')
}

// Text truncation functions for consistency
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

const truncateWords = (text, maxWords) => {
  if (!text) return ''
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(' ') + '...'
}

const templateBadge = computed(() => {
  const badges = {
    'massive_email': {
      label: 'Masivo',
      class: 'bg-blue-600',
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    'landing_confirmation': {
      label: 'Landing',
      class: 'bg-green-600',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    'transactional_email': {
      label: 'Transaccional',
      class: 'bg-purple-600',
      icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
    },
    'notification_email': {
      label: 'Notificación',
      class: 'bg-yellow-600',
      icon: 'M15 17h5l-5-5v5zM10.5 3.75a6 6 0 0 1 9.356 5.23A1.5 1.5 0 0 1 18.75 10.5H12a6 6 0 0 1-1.5-6.75z'
    },
    'welcome_email': {
      label: 'Bienvenida',
      class: 'bg-pink-600',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    },
    'follow_up_email': {
      label: 'Seguimiento',
      class: 'bg-indigo-600',
      icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
    },
    'newsletter_email': {
      label: 'Newsletter',
      class: 'bg-orange-600',
      icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'
    },
    'promotional_email': {
      label: 'Promocional',
      class: 'bg-red-600',
      icon: 'M7 4V2a1 1 0 011-1h3a1 1 0 011 1v2h4a1 1 0 011 1v3a1 1 0 01-1 1h-4v4a1 1 0 01-1 1H8a1 1 0 01-1-1V9H3a1 1 0 01-1-1V5a1 1 0 011-1h4z'
    },
    'event_email': {
      label: 'Evento',
      class: 'bg-teal-600',
      icon: 'M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 6V9h12v6a2 2 0 01-2 2H10a2 2 0 01-2-2z'
    }
  }
  
  return badges[props.template.template_type] || {
    label: 'Email',
    class: 'bg-gray-600',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
  }
})
</script>