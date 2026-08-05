<template>
  <section class="border-b border-glass-border bg-body py-12">
    <div class="w-full">
      <h2 class="text-2xl font-bold text-main sm:text-3xl">{{ title }}</h2>
      <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
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
