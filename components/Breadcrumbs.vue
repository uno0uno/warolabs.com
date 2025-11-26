<template>
  <nav class="text-xs text-secondary mb-6 flex items-center gap-2">
    <NuxtLink 
      v-for="(crumb, index) in crumbs" 
      :key="index"
      :to="crumb.path"
      :class="[
        'hover:text-main transition',
        index === crumbs.length - 1 ? 'text-accent font-medium' : ''
      ]"
    >
      {{ crumb.label }}
    </NuxtLink>
    <span v-if="index < crumbs.length - 1" class="text-secondary">/</span>
  </nav>
</template>

<script setup>
const props = defineProps({
  crumbs: {
    type: Array,
    required: true,
    // Example: [{ label: 'Docs', path: '/blog' }, { label: 'Guías', path: '/blog/guias' }]
  }
})
</script>
