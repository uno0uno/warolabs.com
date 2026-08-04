<template>
  <div class="min-h-screen bg-body">
    <BlogHero />
    <BlogMasthead title="Blog de WARO Labs" subtitle="Conocimiento accionable sobre IA, automatización y software a medida para empresas." />
    <BlogCategorySection title="Explora por tema" />

    <section id="articulos" class="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <BlogSearchBar v-model="searchInput" @search="onSearch" />
      <BlogFilters v-model="activePillar" :total="data?.total ?? null" />

      <CommonsTheLoading v-if="pending && !data" label="Cargando artículos…" />

      <div v-else-if="error" class="rounded-lg border border-destructive bg-destructive/5 p-6 text-center text-sm">
        No pudimos cargar los artículos. Intenta de nuevo.
      </div>

      <div v-else-if="!data?.items?.length" class="flex flex-col items-center gap-3 py-16 text-center">
        <p class="text-lg text-text-body">
          <template v-if="activePillar">Aún no hay artículos publicados en esta categoría.</template>
          <template v-else-if="searchInput">No encontramos artículos para «{{ searchInput }}».</template>
          <template v-else>Aún no hay artículos publicados.</template>
        </p>
        <NuxtLink v-if="activePillar || searchInput" to="/blog" class="text-sm text-accent hover:underline">
          Ver todos los artículos
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <BlogFeaturedArticleCard
          v-if="featured"
          :article="featured"
          class="sm:col-span-2 lg:col-span-3"
        />
        <BlogCard
          v-for="article in rest"
          :key="article.id"
          :article="article"
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

definePageMeta({ layout: 'default' });

useHead({
  title: 'Blog de WARO Labs — IA, Automatización y Software a Medida',
  meta: [
    { name: 'description', content: 'Artículos prácticos sobre IA aplicada, automatización de procesos y desarrollo de software a medida para empresas.' },
  ],
});

const route = useRoute();
const router = useRouter();

const searchInput = ref(typeof route.query.q === 'string' ? route.query.q : '');
const activeSearch = ref<string | null>(searchInput.value.trim() ? searchInput.value.trim() : null);
const activePillar = ref<BlogPillarValue | null>(
  typeof route.query.pillar === 'string' && isBlogPillar(route.query.pillar) ? route.query.pillar : null
);
const page = ref(Number.parseInt(String(route.query.page ?? '1'), 10) || 1);
const pageSize = 12;

const { data, pending, error, refresh } = await useBlogIndex({
  pillar: activePillar,
  search: activeSearch,
  page,
  pageSize,
});

watch([activePillar, activeSearch, page], async () => {
  await refresh();
});

const featured = computed(() => (data.value?.items?.length ? data.value.items[0] : null));
const rest = computed(() => (data.value?.items?.slice(1) ?? []));

function onSearch(value: string) {
  activeSearch.value = value.trim() ? value.trim() : null;
  page.value = 1;
  router.replace({ query: { ...route.query, q: value || undefined, page: undefined } });
}

watch(activePillar, (newPillar) => {
  router.replace({ query: { ...route.query, pillar: newPillar ?? undefined, page: undefined } });
  page.value = 1;
});
</script>
