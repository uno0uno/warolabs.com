<template>
  <aside class="card-base mt-12 flex flex-col gap-4 border border-glass-border bg-surface/40 p-6 sm:flex-row sm:items-center">
    <img
      v-if="author?.avatar"
      :src="author.avatar"
      :alt="author.name"
      class="h-16 w-16 rounded-full object-cover"
    />
    <div class="flex-1">
      <p class="text-xs font-semibold uppercase tracking-wider text-accent">Autor</p>
      <h3 class="text-lg font-bold text-main">{{ author?.name }}</h3>
      <p v-if="author?.userName" class="text-sm text-text-body">@{{ author.userName }}</p>
      <p v-if="author?.description" class="mt-3 text-sm leading-relaxed text-text-body">{{ author.description }}</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { ArticleAuthor } from '~/composables/useBlog';
defineProps<{ author: ArticleAuthor | null }>();
</script>
