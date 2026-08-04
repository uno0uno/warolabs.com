<template>
  <div class="flex items-center justify-center py-12" role="status" aria-live="polite">
    <div class="flex flex-col items-center gap-3">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-glass-border border-t-accent" />
      <p v-if="label" class="text-sm text-text-body">{{ label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label?: string }>();
</script>
