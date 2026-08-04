<template>
  <nav class="flex items-center gap-1.5 text-sm text-text-body" aria-label="Breadcrumb">
    <NuxtLink to="/" class="hover:text-accent">Inicio</NuxtLink>
    <ChevronRightIcon class="h-4 w-4 text-text-body/60" />
    <NuxtLink to="/blog" class="hover:text-accent">Blog</NuxtLink>
    <template v-if="current">
      <ChevronRightIcon class="h-4 w-4 text-text-body/60" />
      <span class="text-main">{{ current }}</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { ChevronRightIcon } from '@heroicons/vue/20/solid';
defineProps<{ current?: string }>();
</script>
