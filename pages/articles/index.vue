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
    class="flex flex-col gap-6 sm:gap-12 justify-center font-principal pb-12"
  >
  <div class="md:col-span-6 lg:col-span-5">
        <img itemprop="image"
        class="md:rounded-xl rounded-xl object-cover w-full"
        v-bind="{'src':`https://warocolombia.infura-ipfs.io/ipfs/${article.cover}`, 'alt':article.slug}">
  </div>



          <div class="not-prose flex gap-4 items-start sm:px-10">
                <img itemprop="image"
                class="rounded-lg object-cover w-20"
                v-bind="{'src':`https://warocolombia.infura-ipfs.io/ipfs/${article.creator.profile_pic}`, 'alt':article.slug}">
                <div class="flex flex-col gap-0">
                  <p class="text-normal">Puplicado: {{article.created_at}}</p>
                  <p class="text-normal font-bold">{{article.creator.full_name}}</p>
                </div>

          </div>
  <article class="article-style sm:px-10 sm:pt-6">
          <div v-html="md.render(article.content)"></div>
  </article>
</div>
</template>