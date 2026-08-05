<template>
  <div class="min-h-screen bg-body">
    <CommonsTheLoading v-if="pending && !data" label="Cargando artículo…" />

    <div v-else-if="error || !article" class="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <h1 class="text-2xl font-bold text-main">Artículo no encontrado</h1>
      <p class="mt-2 text-text-body">Es posible que el artículo que buscas ya no esté disponible.</p>
      <NuxtLink to="/blog" class="btn-primary mt-6 inline-block">Volver al blog</NuxtLink>
    </div>

    <article v-else>
      <BlogArticleHero
        :title="article.title"
        :description="article.description"
        :pillar="article.pillar"
        :author="author"
        :published-at="article.publishedAt"
      />
      <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <BlogBreadcrumb :current="article.title" class="mb-6" />
        <div class="animate-fade-in" style="animation-delay: 0.5s">
          <BlogArticleContent :content="article.content" />
        </div>
        <div class="animate-fade-in-up" style="animation-delay: 0.7s">
          <BlogAuthorCard :author="author" />
        </div>
        <div class="animate-fade-in-up" style="animation-delay: 0.85s">
          <BlogArticleCTA />
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  pageTransition: false,
  layoutTransition: false,
});

const route = useRoute();
const slug = computed(() => String(route.params.slug ?? ''));

const { data, pending, error } = await useBlogArticle(slug);

const article = computed(() => data.value?.article ?? null);
const author = computed(() => data.value?.author ?? null);

useHead(() => ({
  title: article.value ? `${article.value.metaTitle} | WARO Labs` : 'Artículo | WARO Labs',
  meta: article.value
    ? [
        { name: 'description', content: article.value.metaDescription },
        { property: 'og:title', content: article.value.metaTitle },
        { property: 'og:description', content: article.value.metaDescription },
        { property: 'og:image', content: article.value.cover },
        { property: 'og:type', content: 'article' },
      ]
    : [],
}));

if (process.client && article.value?.slug) {
  const { execute: postView } = useBlogView(slug);
  onMounted(() => {
    postView().catch(() => { /* ignore analytics errors */ });
  });
}
</script>

<style>
/* Override del layout default: desactiva la transición de "box open" del mask-radial. */
.mask-radial {
  transition: none !important;
}
</style>
