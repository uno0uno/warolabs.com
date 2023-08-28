<script setup>

const route = useRoute();
const path = ref();

watchEffect(() => {
  path.value = route.path.split('/');
});

</script>

<template>
  <nav v-if="path.length > 1" aria-label="Breadcrumb">
    <ol
      itemscope
      itemtype="http://schema.org/BreadcrumbList"
      class="flex items-center gap-1 text-sm text-gray-600"
    >
      <!-- Elemento "Inicio" -->
      <li
        itemprop="itemListElement"
        itemscope
        itemtype="http://schema.org/ListItem"
        class="cursor-pointer text-slate-900 text-lg"
      >
        <NuxtLink :to="`/`">
          <span itemprop="name">Inicio</span>
        </NuxtLink>
        <meta itemprop="position" content="1" />
      </li>

      <!-- Separador -->
      <li class="rtl:rotate-180">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </li>

      <!-- Segmentos de la ruta -->
      <template v-for="(segment, index) in path.slice(1, path.length - 1)" :key="index">

        <li
          itemprop="itemListElement"
          itemscope
          itemtype="http://schema.org/ListItem"
          class="cursor-pointer text-slate-900 text-lg"
        >
          <NuxtLink :to="`/${segment}`">
            <span itemprop="name">{{ segment }}</span>
          </NuxtLink>
          <meta itemprop="position" :content="index + 2" />
        </li>
      </template>
    </ol>
  </nav>
</template>



<style lang="scss" scoped></style>
