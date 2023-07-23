<script setup>

const {
  data: promos,
  pending,
  refresh,
  execute,
  error,
} = await useAsyncData('promotions', () => {
  try {
    return $fetch(`/api/promos/allPromos`);
  } catch (error) {
    return error;
  }
});

async function openPromo(slug,id) {
  await navigateTo({ path: `/promociones/${slug}-PROM${id}` });
}

</script>

<template>
  <div v-if="pending">LOADING...</div>
  <div v-else-if="error">Error al cargar los datos: {{ error }}</div>
  <div v-else-if="promos.length === 0">Not found</div>
  <div v-else-if="promos.code == '22P02'">Not found</div>

  <div v-else class="flex flex-col gap-2">

    <CommonTheBreadcrumb></CommonTheBreadcrumb>

    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 md:gap-4 gap-2 py-4">
      <div v-for="promo in promos" :key="promo.name">
        <div
          @click="openPromo(promo.slug,promo.id)"
          class="block rounded-lg shadow-sm bg-slate-100 border-2 cursor-pointer"
        >
          <img
            itemprop="image"
            class="md:rounded-t-lg rounded-t-lg object-cover w-full"
            v-bind="{
              src: `https://warocolombia.infura-ipfs.io/ipfs/${promo.image}`,
              alt: promo.name,
            }"
          />

          <div class="p-2">
            <dl>
              <div class="flex">
                <dt class="sr-only">Price</dt>
                <dd class="text-sm text-gray-500">
                  ${{ promo.price }}
                </dd>
              </div>

              <div>
                <dt class="sr-only">Name Promotion</dt>
                <dd class="font-medium text-m md:text-m">{{ promo.name }}</dd>
              </div>
              <div>
                <dt class="sr-only">Seller</dt>
                <dd class="text-sm text-gray-500">
                  {{promo.discotecas.name}}
                </dd>
              </div>
            </dl>

            <div class="mt-2 flex items-center gap-4 text-xs"></div>
          </div>
        </div>
      </div>
    </div>
    
    <Head>
      <Title>Descuentos discotecas en Bogotá | Waro Colombia</Title>
      <Meta
        property="og:title"
        v-bind="{ content: `Descuentos discotecas en Bogotá | Waro Colombia` }"
      />
      <Meta name="description" v-bind="{ content: `Descubre los mejores descuentos en discotecas de Bogotá. ¡Conoce más!` }" />
      <Meta property="og:description" v-bind="{ content: `Descubre los mejores descuentos en discotecas de Bogotá. ¡Conoce más!` }" />
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

