<template>
  <div class="min-h-screen bg-body">
    <BlogHero />

    <section class="py-12 sm:py-16">
      <CommonsTheLoading v-if="pending && !data" label="Cargando artículos…" />

      <div v-else-if="error" class="rounded-lg border border-destructive bg-destructive/5 p-6 text-center text-sm">
        No pudimos cargar los artículos. Intenta de nuevo.
      </div>

      <div v-else-if="!data?.items?.length" class="flex flex-col items-center gap-3 py-16 text-center">
        <p class="text-lg text-text-body">Aún no hay artículos publicados.</p>
      </div>

      <div v-else class="grid grid-cols-1 items-stretch auto-rows-fr gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
        <BlogCard
          v-for="(article, index) in articles"
          :key="article.id"
          :article="article"
          class="animate-fade-in-up"
          :style="{ animationDelay: `${0.2 + index * 0.08}s` }"
        />
      </div>

      <BlogPagination
        v-if="data?.total && data.total > pageSize"
        :page="page"
        :page-size="pageSize"
        :total="data.total"
        @update:page="(p) => (page = p)"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { isBlogPillar, type BlogPillarValue } from '~/utils/blog/pillars';

definePageMeta({
  layout: 'default',
  pageTransition: false,
  layoutTransition: false,
});

useHead({
  title: 'Blog de WARO Labs — IA, Automatización y Software a Medida',
  meta: [
    { name: 'description', content: 'Abrimos nuestro proceso de crear software open-source con IA: guías para empresas, hackers y desarrolladores.' },
  ],
});

const route = useRoute();
const page = ref(Number.parseInt(String(route.query.page ?? '1'), 10) || 1);
const pageSize = 12;

const activePillar = ref<BlogPillarValue | null>(
  typeof route.query.pillar === 'string' && isBlogPillar(route.query.pillar) ? route.query.pillar : null
);

const { data, pending, error, refresh } = await useBlogIndex({
  pillar: activePillar,
  page,
  pageSize,
});

watch([activePillar, page], async () => {
  await refresh();
});

const articles = computed(() => (data.value?.items ?? []));

watch(activePillar, (newPillar) => {
  router.replace({ query: { ...route.query, pillar: newPillar ?? undefined, page: undefined } });
  page.value = 1;
});
</script>

<style>
/* Override del layout default: desactiva la transición de "box open" del mask-radial
   solo cuando esta página está activa. */
.mask-radial {
  transition: none !important;
}
</style>
