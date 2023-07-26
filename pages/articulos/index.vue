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
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 md:gap-4 gap-2 py-4">
      <div v-for="article in allArticles" :key="article.title">
        <div
          @click="openArticle(article.slug,article.id)"
          class="block rounded-lg shadow-sm bg-slate-100 border-2 cursor-pointer"
        >
          <img
            itemprop="image"
            class="md:rounded-t-lg rounded-t-lg object-cover w-full"
            v-bind="{
              src: `https://warocolombia.infura-ipfs.io/ipfs/${article.cover}`,
              alt: article.title,
            }"
          />

          <div class="p-2">
            <dl class="flex flex-col gap-0.5">
              <div>
                <dt class="sr-only">Name</dt>
                <dd class="font-bold text-m md:text-m">{{ article.title }}</dd>
              </div>
              <div class="flex">
                <dt class="sr-only">Price</dt>
                <dd class="text-sm text-gray-600">
                  Autor: {{ article.creator.full_name }} 
                </dd>
              </div>
              <div>
                <dt class="sr-only">Address</dt>
                <dd class="text-sm text-gray-900">
                  {{ displayTextDescription(article.description_seo) }}
                </dd>
              </div>

            </dl>

            <div class="mt-2 flex items-center gap-4 text-xs"></div>
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