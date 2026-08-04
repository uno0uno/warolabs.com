<template>
  <section class="border-b border-glass-border bg-body py-12">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <h2 class="text-2xl font-bold text-main sm:text-3xl">{{ title }}</h2>
      <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.value"
          :to="{ path: '/blog', query: { pillar: cat.value } }"
          class="card-base flex flex-col gap-2 border border-glass-border bg-surface/50 p-5 transition hover:border-accent"
        >
          <span class="text-base font-semibold text-main">{{ cat.label }}</span>
          <span class="text-sm text-text-body">{{ cat.description }}</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { BLOG_PILLARS } from '~/composables/useBlog';
defineProps<{ title?: string }>();
const categories = BLOG_PILLARS;
</script>
