<template>
  <header class="border-b border-glass-border bg-body">
    <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div v-if="pillarLabel" class="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
        {{ pillarLabel }}
      </div>
      <h1 class="text-3xl font-bold text-main sm:text-4xl lg:text-5xl">{{ title }}</h1>
      <p class="mt-4 text-lg text-text-body">{{ description }}</p>
      <div v-if="author" class="mt-6 flex items-center gap-3">
        <img
          v-if="author.avatar"
          :src="author.avatar"
          :alt="author.name"
          class="h-10 w-10 rounded-full object-cover"
        />
        <div class="flex flex-col text-sm">
          <span class="font-medium text-main">{{ author.name }}</span>
          <time :datetime="publishedAt" class="text-text-body/80">{{ formattedDate }}</time>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { ArticleAuthor } from '~/composables/useBlog';
import { getBlogPillarLabel } from '~/composables/useBlog';

const props = defineProps<{
  title: string;
  description: string;
  pillar: string | null;
  author?: ArticleAuthor | null;
  publishedAt: string;
}>();

const pillarLabel = computed(() => (props.pillar ? getBlogPillarLabel(props.pillar) : null));

const formattedDate = computed(() => {
  try {
    return new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(props.publishedAt));
  } catch {
    return props.publishedAt;
  }
});
</script>
