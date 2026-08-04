<template>
  <article class="card-base flex h-full flex-col overflow-hidden border border-glass-border bg-surface/40 transition hover:border-accent">
    <NuxtLink :to="`/blog/${article.slug}`" class="block">
      <img
        :src="article.thumbnail || article.cover"
        :alt="article.title"
        class="h-40 w-full object-cover"
        loading="lazy"
      />
    </NuxtLink>
    <div class="flex flex-1 flex-col gap-2 p-5">
      <span v-if="pillarLabel" class="text-xs font-semibold uppercase tracking-wider text-accent">
        {{ pillarLabel }}
      </span>
      <h3 class="text-lg font-bold text-main">
        <NuxtLink :to="`/blog/${article.slug}`" class="hover:text-accent">
          {{ article.title }}
        </NuxtLink>
      </h3>
      <p class="line-clamp-2 text-sm text-text-body">{{ article.description }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { ArticleSummary } from '~/composables/useBlog';
import { getBlogPillarLabel } from '~/composables/useBlog';

const props = defineProps<{ article: ArticleSummary }>();
const pillarLabel = computed(() => (props.article.pillar ? getBlogPillarLabel(props.article.pillar) : null));
</script>
