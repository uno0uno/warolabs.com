<script setup>
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();
const renderedMarkdown = ref('');

const {
  data: articles,
  pending,
  refresh,
  execute,
  error,
} = await useAsyncData('article-content', () => {
  try {
    return $fetch(`/api/articles/articleContent`);
  } catch (error) {
    return error;
  }
});

</script>

<template>
  <div
    v-for="article in articles"
    :key="article.slug"
    class="flex justify-center font-principal py-12"
  >
  <article class="article-style">
          <div v-html="md.render(article.content)"></div>
  </article>
</div>
</template>