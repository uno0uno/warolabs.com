<template>
  <article class="card-base flex flex-col overflow-hidden border border-glass-border bg-surface/50 transition hover:border-accent">
    <NuxtLink :to="`/blog/${article.slug}`" class="block">
      <img
        :src="article.cover"
        :alt="article.title"
        class="h-56 w-full object-cover"
        loading="lazy"
      />
    </NuxtLink>
    <div class="flex flex-1 flex-col gap-3 p-6">
      <span v-if="pillarLabel" class="text-xs font-semibold uppercase tracking-wider text-accent">
        {{ pillarLabel }}
      </span>
      <h3 class="text-xl font-bold text-main">
        <NuxtLink :to="`/blog/${article.slug}`" class="hover:text-accent">
          {{ article.title }}
        </NuxtLink>
      </h3>
      <p class="line-clamp-3 text-sm text-text-body">{{ article.description }}</p>
      <div class="mt-auto flex items-center gap-3 pt-4">
        <img
          v-if="article.author.avatar"
          :src="article.author.avatar"
          :alt="article.author.name"
          class="h-8 w-8 rounded-full object-cover"
        />
        <div class="flex flex-col text-xs text-text-body/80">
          <span class="font-medium text-main">{{ article.author.name }}</span>
          <time :datetime="article.publishedAt">{{ formattedDate }}</time>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { ArticleSummary } from '~/composables/useBlog';
import { getBlogPillarLabel } from '~/composables/useBlog';

const props = defineProps<{ article: ArticleSummary }>();

const pillarLabel = computed(() => (props.article.pillar ? getBlogPillarLabel(props.article.pillar) : null));

const formattedDate = computed(() => {
  try {
    return new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(props.article.publishedAt));
  } catch {
    return props.article.publishedAt;
  }
});
</script>
