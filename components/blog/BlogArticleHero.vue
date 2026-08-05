<template>
  <header class="relative overflow-hidden border-b border-glass-border bg-body">
    <div class="bg-dot-pattern pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
    <div class="bg-mask-radial pointer-events-none absolute inset-0" aria-hidden="true" />

      <div class="relative z-10 public-page-container py-12 lg:py-20">
        <div class="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-16">
          <div class="flex flex-col gap-5 lg:col-span-7">
            <div v-if="pillarLabel" class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent animate-fade-in-up" style="animation-delay: 0.1s">
              {{ pillarLabel }}
            </div>

            <h1 class="animate-fade-in-up font-display text-3xl font-normal leading-[1.15] tracking-tight text-main sm:text-4xl lg:text-5xl" style="animation-delay: 0.2s">
              {{ title }}
            </h1>

            <div v-if="author" class="animate-fade-in-up flex items-center gap-3 pt-1" style="animation-delay: 0.3s">
              <div v-if="author.avatar" class="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-glass-border">
                <img :src="author.avatar" :alt="author.name" class="h-full w-full object-cover" />
              </div>
              <div v-else class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-glass">
                <span class="text-sm font-bold text-accent">{{ author.name?.charAt(0) || 'W' }}</span>
              </div>

              <div class="flex flex-wrap items-center gap-1.5 text-sm text-text-body">
                <span class="font-semibold text-main">{{ author.name }}</span>
                <span aria-hidden="true">·</span>
                <time :datetime="publishedAt">{{ formattedDate }}</time>
                <span aria-hidden="true">·</span>
                <span>{{ readingTime }} min de lectura</span>
              </div>
            </div>
          </div>

          <div class="animate-fade-in-up hidden lg:col-span-5 lg:block lg:pt-14" style="animation-delay: 0.4s">
            <p
              v-if="description"
              class="border-s-2 border-accent ps-5 text-base leading-relaxed text-text-body lg:text-lg"
            >
              {{ description }}
            </p>
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
    return new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(props.publishedAt));
  } catch {
    return props.publishedAt;
  }
});

const readingTime = computed(() => {
  const wordsPerMinute = 200;
  const words = props.description?.split(/\s+/).length ?? 0;
  return Math.max(3, Math.ceil(words / wordsPerMinute));
});
</script>
