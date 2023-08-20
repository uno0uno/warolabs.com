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
  await navigateTo({ path: `/blog/${slug}-PUB${id}` });
}


</script>

<template>
  <div v-if="pending">LOADING...</div>
  <div v-else-if="error">Error al cargar los datos: {{ error }}</div>
  <div v-else-if="allArticles.length === 0">Not found</div>
  <div v-else-if="allArticles.code == '22P02'">Not found</div>
  <div v-else class="flex flex-col">
  <CommonTheBreadcrumb></CommonTheBreadcrumb>
    <div class="grid justify-items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-2 py-4 gap-4">
      <div class="border-4 border-dashed rounded-xl" v-for="article in allArticles" :key="article.title">
        <div
          @click="openArticle(article.slug,article.id)"
          class="flex flex-col w-full py-2 sm:py-4 px-2 gap-1 rounded-lg hover:bg-slate-50 border-1 cursor-pointer"
        > 
          <div class="flex gap-2 items-center">
          <div class="flex gap-1 items-center">
            <LogosTheHashTag class="h-4 w-4 md:h-6 md:w-6 text-emerald-500"/>
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
            <LogosTheEye class="h-4 w-4 md:h-6 md:w-6 text-slate-900"/>
            <p class="font-normal text-sm sm:text-lg text-slate-600">{{ article.views }}</p>
          </div>
          </div>

        </div>
      </div>
    </div>

    <Head>
        <Title >▷ Qué hacer en bogotá | Waro Colombia</Title>
        <Meta name="description" :content="`La cultura es un derecho de todos los ciudadanos. ¡Apóyala!`" />

        <Meta property="og:type" content="website" />
        <Meta property="og:title" :content="`▷ Qué hacer en bogotá | Waro Colombia`" />
        <Meta property="og:description" :content="`La cultura es un derecho de todos los ciudadanos. ¡Apóyala!`" />
        <Meta property="og:image" :content="`https://warocolombia.infura-ipfs.io/ipfs/Qmf2N1fW4SKpgrY5Zy1nvVJsWTsPJVZYPyYbUuQWjBCsFt`" />
        <Meta property="og:image:width" content="828" />
        <Meta property="og:image:height" content="450" />
        <Meta property="og:url" :content="`https://warocol.com/blog`" />
        <Meta property="og:site_name" content="Waro Colombia" />

        <Meta name="twitter:card" content="summary_large_image" />
        <Meta name="twitter:site" content="@saifer101_" />
        <Meta name="twitter:title" :content="`▷ Qué hacer en bogotá | Waro Colombia`" />
        <Meta name="twitter:description" :content="`La cultura es un derecho de todos los ciudadanos. ¡Apóyala!`" />
        <Meta name="twitter:image" :content="`https://warocolombia.infura-ipfs.io/ipfs/Qmf2N1fW4SKpgrY5Zy1nvVJsWTsPJVZYPyYbUuQWjBCsFt`" />
    </Head>

  </div>

</template>