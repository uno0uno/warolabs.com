<template>
  <article
    class="group flex h-full flex-col overflow-hidden rounded-2xl border border-glass-border bg-surface transition-colors duration-300 hover:border-accent"
  >
    <NuxtLink :to="`/blog/${article.slug}`" class="relative h-40 flex-shrink-0 overflow-hidden sm:h-48 lg:h-52">
      <img
        v-if="article.cover"
        :src="article.cover"
        :alt="article.title"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" aria-hidden="true" />

      <span
        class="absolute bottom-3.5 end-3.5 inline-flex items-center gap-1 rounded-lg bg-glass px-2.5 py-1 text-[10px] font-medium text-main backdrop-blur-sm"
      >
        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ readingTime }} min
      </span>
    </NuxtLink>

    <div class="flex min-h-0 flex-1 flex-col p-5">
      <div class="min-h-0 flex-1">
        <span v-if="pillarLabel" class="mb-2 block text-xs font-semibold uppercase tracking-wider text-accent">
          {{ pillarLabel }}
        </span>
        <NuxtLink :to="`/blog/${article.slug}`" class="mb-3 block">
          <h3 class="line-clamp-2 text-lg font-bold leading-snug text-main transition-colors duration-200 group-hover:text-accent">
            {{ article.title }}
          </h3>
        </NuxtLink>
        <p class="line-clamp-2 text-sm leading-relaxed text-text-body">{{ article.description }}</p>
      </div>

      <div class="mt-5 flex items-center justify-between border-t border-glass-border pt-4">
        <div class="flex items-center gap-2.5">
          <img
            v-if="article.author.avatar"
            :src="article.author.avatar"
            :alt="article.author.name || 'Autor'"
            class="h-7 w-7 rounded-full object-cover ring-1 ring-glass-border"
          />
          <div v-else class="flex h-7 w-7 items-center justify-center rounded-full bg-glass ring-1 ring-glass-border">
            <span class="text-[10px] font-bold text-accent">{{ article.author.name?.charAt(0) || 'W' }}</span>
          </div>
          <div>
            <p class="text-xs font-semibold leading-none text-main">{{ article.author.name || 'WARO Labs' }}</p>
            <p class="mt-0.5 text-[10px] text-text-body/80">{{ formattedDate }}</p>
          </div>
        </div>

        <NuxtLink
          :to="`/blog/${article.slug}`"
          class="flex h-8 w-8 items-center justify-center rounded-full bg-main text-body transition-colors duration-200 hover:bg-accent hover:text-white"
          aria-label="Leer artículo"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NuxtLink>
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
