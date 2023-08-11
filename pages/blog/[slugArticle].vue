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
    :key="article.article_slug"
    class="flex flex-col gap-8 justify-start items-start pb-12"
  >
    <div class="flex flex-col gap-6 w-full ">
    <div class="">
      <CommonTheBreadcrumb></CommonTheBreadcrumb>
      </div>
      <div class="">
            <img itemprop="image"
            class="md:rounded-xl rounded-xl object-cover w-full"
            v-bind="{'src':`https://warocolombia.infura-ipfs.io/ipfs/${article.article_cover}`, 'alt':article.article_slug}">
      </div>
      <div class=" flex flex-col sm:flex-row gap-4 ">
          <div class=" flex gap-4">
                <img itemprop="image"
                class="rounded-lg object-cover w-20"
                v-bind="{'src':`https://warocolombia.infura-ipfs.io/ipfs/${article.creator_profile_pic}`, 'alt':article.creator_full_name}">
                <div class="flex flex-col">
                  <p class="text-normal sm:text-lg font-bold">
                    {{article.creator_full_name}}
                  </p>
                  <p class="text-sm sm:text-normal sm:w-3/4">
                    Publicadó: {{article.article_created_at}}
                  </p>
                <div class="flex gap-1 items-center">
                  <LogosTheEye class="h-42w-4 md:h-4 md:w-4 text-slate-900"/>
                  <p class="font-normal text-sm sm:text-normal text-slate-600">{{ article.article_views }}</p>
                </div>  
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



    <article class="article-style">
            <div v-html="md.render(article.article_content)"></div>
    </article>
    <CommonTheFeedBackBox 
    v-bind:id="route.path"
    ></CommonTheFeedBackBox>
    
    <Head>
        <Title>{{ article.article_title }} | Waro Colombia </Title>
        <Meta
          property="og:title"
          v-bind="{ content: `${article.article_title} | Waro Colombia` }"
        />
        <Meta name="description" v-bind="{ content: `${article.article_description_seo}` }" />
        <Meta property="og:description" :content="article.article_description_seo" />
        <Meta
          property="og:image"
          v-bind="{
            content: `https://warocolombia.infura-ipfs.io/ipfs/${article.article_cover}`,
          }"
        />
        <Meta name="twitter:card" content="summary_large_image" />
    </Head>

  </div>
</template>
