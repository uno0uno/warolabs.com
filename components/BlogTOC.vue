<template>
  <div class="sticky top-6">
    <h3 class="text-xs font-semibold text-main uppercase tracking-wider mb-4">
      En esta página
    </h3>

    <div class="relative pl-3">
      <!-- Vertical progress line -->
      <div class="absolute left-0 top-0 bottom-0 w-px bg-glass-border"></div>
      <div 
        class="absolute left-0 top-0 w-0.5 bg-accent transition-all duration-300"
        :style="{ height: activeIndicatorHeight }"
      ></div>
      
      <nav class="space-y-3">
        <a
          v-for="heading in headings"
          :key="heading.id"
          :href="`#${heading.id}`"
          @click.prevent="scrollToHeading(heading.id)"
          :class="[
            'block text-sm transition-colors',
            activeId === heading.id
              ? 'text-accent font-medium'
              : 'text-secondary hover:text-main',
            heading.level === 3 ? 'pl-3' : ''
          ]"
        >
          {{ heading.text }}
        </a>
      </nav>
    </div>

    <!-- Feedback section -->
    <div class="mt-8 pt-6 border-t border-glass-border">
      <p class="text-xs text-secondary mb-2">¿Fue útil esta página?</p>
      <div class="flex gap-2">
        <button class="px-3 py-1.5 text-xs bg-glass hover:bg-surface border border-glass-border rounded transition-colors">
          <HandThumbUpIcon class="w-4 h-4 inline mr-1" />
          Sí
        </button>
        <button class="px-3 py-1.5 text-xs bg-glass hover:bg-surface border border-glass-border rounded transition-colors">
          <HandThumbDownIcon class="w-4 h-4 inline mr-1" />
          No
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/vue/24/outline'

const headings = ref([])
const activeId = ref('')
const activeIndicatorHeight = ref('0px')

onMounted(() => {
  // Extract headings from the page
  updateHeadings()

  // Setup intersection observer for scroll spy
  setupScrollSpy()
})

const updateHeadings = () => {
  const elements = document.querySelectorAll('main h2, main h3')
  headings.value = Array.from(elements).map(el => ({
    id: el.id || generateId(el.textContent),
    text: el.textContent,
    level: parseInt(el.tagName.charAt(1))
  }))

  // Add IDs to headings if they don't have them
  elements.forEach((el, index) => {
    if (!el.id) {
      el.id = headings.value[index].id
    }
  })
}

const generateId = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const scrollToHeading = (id) => {
  const element = document.getElementById(id)
  if (element) {
    const offset = 80 // Account for fixed header
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

const setupScrollSpy = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      })
    },
    {
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0
    }
  )

  // Observe all headings
  const elements = document.querySelectorAll('main h2, main h3')
  elements.forEach((el) => observer.observe(el))

  // Cleanup on unmount
  onUnmounted(() => {
    elements.forEach((el) => observer.unobserve(el))
  })
}

// Re-extract headings when route changes
const route = useRoute()
watch(() => route.path, () => {
  nextTick(() => {
    updateHeadings()
    setupScrollSpy()
  })
})
</script>
