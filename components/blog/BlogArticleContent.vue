<template>
  <article class="prose prose-lg max-w-none text-text-body">
    <MarkdownRenderer v-if="content" :source="content" />
  </article>
</template>

<script setup lang="ts">
defineProps<{ content: string }>();
</script>
