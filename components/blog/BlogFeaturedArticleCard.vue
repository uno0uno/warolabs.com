<template>
  <article
    class="group relative grid overflow-hidden rounded-2xl border border-glass-border bg-surface transition-colors duration-300 hover:border-accent lg:grid-cols-[1.1fr_1fr]"
  >
    <NuxtLink
      :to="`/blog/${article.slug}`"
      class="relative block min-h-[13rem] overflow-hidden sm:min-h-[18rem] lg:min-h-[20rem]"
    >
      <img
        v-if="article.cover"
        :src="article.cover"
        :alt="article.title"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" aria-hidden="true" />
    </NuxtLink>

    <div class="flex flex-col justify-center p-5 sm:p-8 lg:p-12">
      <div class="mb-3 flex items-center gap-2 text-xs font-medium text-text-body sm:mb-5">
        <span v-if="pillarLabel" class="text-xs font-semibold uppercase tracking-wider text-accent">
          {{ pillarLabel }}
        </span>
        <span aria-hidden="true">·</span>
        <span class="inline-flex items-center gap-1">
          <svg class="h-3.5 w-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ readingTime }} min de lectura
        </span>
      </div>

      <NuxtLink :to="`/blog/${article.slug}`">
        <h2 class="mb-3 text-xl font-bold leading-tight text-main transition-colors duration-200 group-hover:text-accent sm:text-2xl lg:text-3xl">
          {{ article.title }}
        </h2>
      </NuxtLink>

      <p class="mb-5 line-clamp-2 text-sm leading-relaxed text-text-body sm:line-clamp-3 sm:text-base lg:text-lg">
        {{ article.description }}
      </p>

      <NuxtLink
        :to="`/blog/${article.slug}`"
        class="mb-4 inline-flex items-center gap-2 self-start rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:gap-3"
      >
        Leer artículo
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </NuxtLink>

      <div class="flex items-center gap-3 border-t border-glass-border pt-6">
        <img
          v-if="article.author.avatar"
          :src="article.author.avatar"
          :alt="article.author.name || 'Autor'"
          class="h-9 w-9 rounded-full object-cover ring-2 ring-glass-border"
        />
        <div v-else class="flex h-9 w-9 items-center justify-center rounded-full bg-glass ring-2 ring-glass-border">
          <span class="text-sm font-bold text-accent">{{ article.author.name?.charAt(0) || 'W' }}</span>
        </div>
        <div>
          <p class="mb-0.5 text-sm font-semibold leading-none text-main">{{ article.author.name || 'WARO Labs' }}</p>
          <p class="text-xs text-text-body/80">{{ formattedDate }}</p>
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

const readingTime = computed(() => {
  const wordsPerMinute = 200;
  const words = props.article.description?.split(/\s+/).length ?? 0;
  return Math.max(3, Math.ceil(words / wordsPerMinute));
});
</script>
