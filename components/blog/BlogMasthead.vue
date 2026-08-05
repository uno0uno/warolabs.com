<template>
  <div class="border-b border-glass-border bg-surface/40">
    <div class="w-full py-6">
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
