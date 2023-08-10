<script setup>
import MarkdownIt from 'markdown-it';

const route = useRoute();
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
    return $fetch(`/api/articles/articleContent?slug=${route.params.slugArticle}`);
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
    class="flex flex-col gap-3 sm:gap-6  justify-start items-start pb-12"
  >
    <div class="flex flex-col gap-2 sm:gap-8 ">
    <div class="sm:px-10">
      <CommonTheBreadcrumb></CommonTheBreadcrumb>
      </div>
      <div class="">
            <img itemprop="image"
            class="md:rounded-xl rounded-xl object-cover w-full"
            v-bind="{'src':`https://warocolombia.infura-ipfs.io/ipfs/${article.cover}`, 'alt':article.slug}">
      </div>
      <div class=" flex flex-col sm:flex-row  w-full sm:px-10 ">
          <div class=" flex gap-4 items-start">
                <img itemprop="image"
                class="rounded-lg object-cover w-20"
                v-bind="{'src':`https://warocolombia.infura-ipfs.io/ipfs/${article.creator.profile_pic}`, 'alt':article.slug}">
                <div class="flex flex-col">
                  <p class="text-normal sm:text-lg font-bold">
                    {{article.creator.full_name}}
                  </p>
                  <p class="text-sm sm:text-normal sm:w-3/4">
                    Publicadó: {{article.created_at}}
                  </p>
                </div>
          </div >
          <div class="w-auto">
            <CommonTheShareBox
              v-bind:slug="route.path"
              >
            </CommonTheShareBox>
          </div>
    </div>
    </div>



    <article class="article-style sm:px-10">
            <div v-html="md.render(article.content)"></div>
    </article>
    <CommonTheFeedBackBox 
    v-bind:id="route.path"
    ></CommonTheFeedBackBox>
    
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
