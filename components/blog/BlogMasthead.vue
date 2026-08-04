<template>
  <div class="border-b border-glass-border bg-surface/40">
    <div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <h2 class="text-sm font-semibold uppercase tracking-wider text-text-body">
        {{ title }}
      </h2>
      <p v-if="subtitle" class="mt-1 text-sm text-text-body/80">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>();
</script>
