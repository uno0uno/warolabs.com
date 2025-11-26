<template>
  <div class="glass-card p-5 rounded-xl hover-lift cursor-default group">
    <div class="w-10 h-10 bg-body rounded-lg mb-4 flex items-center justify-center text-xl border border-glass-border text-accent">
      {{ icon }}
    </div>
    <h3 class="font-medium text-main mb-2">{{ title }}</h3>
    <p class="text-sm text-text-body leading-relaxed">
      <slot>{{ description }}</slot>
    </p>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: '📦'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
}
</style>
