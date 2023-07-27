<script setup>

const {
  data: allArticles,
  pending,
  refresh,
  execute,
  error,
} = await useAsyncData('article-content', () => {
  try {
    return $fetch(`/api/articles/allArticles`);
  } catch (error) {
    return error;
  }
});

function displayTextDescription(value) {
  return value.slice(0, 160) + '..';
}

async function openArticle(slug,id) {
  await navigateTo({ path: `/articulos/${slug}-PROM${id}` });
}


</script>

<template>
  <div v-if="pending">LOADING...</div>
  <div v-else-if="error">Error al cargar los datos: {{ error }}</div>
  <div v-else-if="allArticles.length === 0">Not found</div>
  <div v-else-if="allArticles.code == '22P02'">Not found</div>
  <div v-else class="flex flex-col gap-2">
  <CommonTheBreadcrumb></CommonTheBreadcrumb>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 md:gap-4 gap-2 py-4">
      <div v-for="article in allArticles" :key="article.title">
        <div
          @click="openArticle(article.slug,article.id)"
          class="grid grid-cols-3 items-center rounded-lg shadow-sm bg-slate-50 border-1 cursor-pointer"
        >
        <div class="col-span-1">
          <img
            itemprop="image"
            class=" rounded-l-lg object-cover"
            v-bind="{
              src: `https://warocolombia.infura-ipfs.io/ipfs/${article.thumbnail}`,
              alt: article.title,
            }"
          />
        </div>
          <div class="px-2 sm:px-4 col-span-2">
            <dl class="flex flex-col justify-center gap-0.5">
              <div>
                <dt class="sr-only">Name</dt>
                <h2 class="font-normal text-sm sm:text-normal md:text-lg">{{ article.title }}</h2>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
    <Head>
      <Title>Opinion | Waro Colombia</Title>
      <Meta
        property="og:title"
        v-bind="{ content: `Opinion | Waro Colombia` }"
      />
      <Meta name="description" v-bind="{ content: `La cultura es un derecho de todos los ciudadanos. ¡Apóyala!` }" />
      <Meta property="og:description" v-bind="{ content: `La cultura es un derecho de todos los ciudadanos. ¡Apóyala!` }" />
      <Meta
        property="og:image"
        v-bind="{
          content: `https://warocolombia.infura-ipfs.io/ipfs/Qmf2N1fW4SKpgrY5Zy1nvVJsWTsPJVZYPyYbUuQWjBCsFt`,
        }"
      />
      <Meta name="twitter:card" content="summary_large_image" />
    </Head>
  </div>

</template>