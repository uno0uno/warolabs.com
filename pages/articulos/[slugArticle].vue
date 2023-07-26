<script setup>
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();
const renderedMarkdown = ref('');
const { slugArticle } = useRoute().params;

const {
  data: articles,
  pending,
  refresh,
  execute,
  error,
} = await useAsyncData('article-content', () => {
  try {
    return $fetch(`/api/articles/articleContent?slug=${slugArticle}`);
  } catch (error) {
    return error;
  }
});

</script>



<template>
  <div v-if="pending">LOADING...</div>
  <div v-else-if="error">Error al cargar los datos: {{ error }}</div>
  <div v-else-if="articles.length === 0">Not found</div>
  <div v-else-if="articles.code == '22P02'">Not found</div>
  <div
  v-else
    v-for="article in articles"
    :key="article.slug"
    class="flex flex-col gap-6 sm:gap-8 justify-center font-principal pb-12"
  >
  <div class="md:col-span-6 lg:col-span-5">
        <img itemprop="image"
        class="md:rounded-xl rounded-xl object-cover w-full"
        v-bind="{'src':`https://warocolombia.infura-ipfs.io/ipfs/${article.cover}`, 'alt':article.slug}">
  </div>

<CommonTheBreadcrumb class="sm:px-10"></CommonTheBreadcrumb>
<div class="not-prose flex flex-col sm:flex-row gap-1 items-start">
    <div class="not-prose flex gap-4 items-start sm:px-10">
          <img itemprop="image"
          class="rounded-lg object-cover w-20"
          v-bind="{'src':`https://warocolombia.infura-ipfs.io/ipfs/${article.creator.profile_pic}`, 'alt':article.slug}">
          <div class="flex flex-col w-auto">
            <p class="text-normal sm:text-lg font-bold w-full">
              {{article.creator.full_name}}
            </p>
            <p class="text-sm sm:text-normal w-2/3">
              Publicadó: {{article.created_at}}
            </p>
          </div>
    </div >
    <div class="flex gap-0 sm:gap-4 sm:px-10">
      <div class="flex gap-2 items-center cursor-pointer hover:bg-slate-100 p-2 hover:rounded-lg">
        <LogosTheExplodingHead class="h-6 w-6 sm:h-8 sm:w-8"/>
        <p class="text-xl">10</p>
      </div>
      <div class="flex gap-2 items-center cursor-pointer hover:bg-slate-100 p-2 hover:rounded-lg">
        <LogosTheShakaHand class="h-6 w-6 sm:h-8 sm:w-8"/>
        <p class="text-xl">10</p>
      </div>
      
      <div class="flex gap-2 items-center cursor-pointer hover:bg-slate-100 p-2 hover:rounded-lg">
        <LogosThefire class="h-6 w-6 sm:h-8 sm:w-8"/>
        <p class="text-xl">10</p>
      </div>
      
    </div>
  </div>

  <article class="article-style sm:px-10">
          <div v-html="md.render(article.content)"></div>
  </article>
  
  <Head>
      <Title>{{ article.title }} | Waro Colombia </Title>
      <Meta
        property="og:title"
        v-bind="{ content: `${article.title} | Waro Colombia` }"
      />
      <Meta name="description" v-bind="{ content: `${article.description_seo}` }" />
      <Meta property="og:description" :content="article.description_seo" />
      <Meta
        property="og:image"
        v-bind="{
          content: `https://warocolombia.infura-ipfs.io/ipfs/${article.cover}`,
        }"
      />
      <Meta name="twitter:card" content="summary_large_image" />
  </Head>

</div>
</template>
