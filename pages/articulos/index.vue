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
  <div v-else class="flex flex-col">
  <CommonTheBreadcrumb></CommonTheBreadcrumb>
    <div class="grid divide-x divide-y divide-x-2 divide-y-2 justify-items-center divide-dotted grid-cols-1 md:grid-cols-2 lg:grid-cols-2 py-4">
      <div v-for="article in allArticles" :key="article.title">
        <div
          @click="openArticle(article.slug,article.id)"
          class="flex flex-col w-full py-2 sm:py-4 px-2 gap-1 rounded-lg hover:bg-slate-50 border-1 cursor-pointer"
        > 
          <div class="flex gap-2 items-center">
          <div class="flex gap-1 items-center">
            <LogosTheHashTag class="h-4 w-4 md:h-6 md:w-6 text-slate-900"/>
            <p class="font-normal text-sm sm:text-lg text-slate-600">{{ article.tags }}</p>
          </div>
          <div class="flex gap-1 items-center">
            <LogosTheWorld class="h-4 w-4 md:h-6 md:w-6 text-slate-900"/>
            <p class="font-normal text-sm sm:text-lg text-slate-600 capitalize">{{ article.planet }}, {{ article.city }} </p>
          </div>
          </div>
            <h2 class="font-bold  text-left text-2xl sm:text-3xl text-slate-900">{{ article.title }}</h2>
          <div class="flex gap-2 items-center">
          <div class="flex gap-1 items-center">
            <LogosTheStats class="h-4 w-4 md:h-6 md:w-6 text-slate-900"/>
            <p class="font-normal text-sm sm:text-lg text-slate-600">{{ article.views }}</p>
          </div>
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