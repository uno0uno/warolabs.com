<template>
  <article class="max-w-none text-text-body">
    <CommonsMarkdownRenderer v-if="content" :source="content" />
  </article>
</template>

<script setup lang="ts">
defineProps<{ content: string }>();
</script>
