<script setup>

const {
  data: discotecas,
  pending,
  refresh,
  execute,
  error,
} = await useAsyncData('discotecas', () => {
  try {
    return $fetch(`/api/business/allBusiness?category=discotecas`);
  } catch (error) {
    return error;
  }
});

function displayTextStreet(value) {
  return value.slice(0, 9) + '...';
}

async function openLocalBusiness(slug) {
  await navigateTo({ path: `/discotecas/${slug}` });
}
</script>

<template>
  <div v-if="pending">LOADING...</div>
  <div v-else-if="error">Error al cargar los datos: {{ error }}</div>
  <div v-else-if="discotecas.length === 0">Not found</div>
  <div v-else-if="discotecas.code == '22P02'">Not found</div>
  <div v-else class="flex flex-col gap-2">
    <CommonTheBreadcrumb></CommonTheBreadcrumb>
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 md:gap-4 gap-2 py-4">
      <div v-for="discoteca in discotecas" :key="discoteca.name">
        <div
          @click="openLocalBusiness(discoteca.user_name)"
          class="block rounded-lg shadow-sm bg-slate-100 border-2 cursor-pointer"
        >
          <img
            itemprop="image"
            class="md:rounded-t-lg rounded-t-lg object-cover w-full"
            v-bind="{
              src: `https://warocolombia.infura-ipfs.io/ipfs/${discoteca.logo_business}`,
              alt: discoteca.logo_business,
            }"
          />

          <div class="p-2">
            <dl>
              <div class="flex">
                <dt class="sr-only">Price</dt>
                <dd class="text-sm text-gray-500">
                  ${{ discoteca.min_price }} - ${{ discoteca.max_price }}
                </dd>
              </div>

              <div>
                <dt class="sr-only">Name</dt>
                <dd class="font-medium text-m md:text-m">{{ discoteca.name }}</dd>
              </div>
              <div>
                <dt class="sr-only">Address</dt>
                <dd class="text-sm text-gray-500">
                  {{ displayTextStreet(discoteca.address) }} -
                  {{ discoteca.city }}
                </dd>
              </div>
            </dl>

            <div class="mt-2 flex items-center gap-4 text-xs"></div>
          </div>
        </div>
      </div>
    </div>

    <Head>
      <Title>Discotecas en Bogotá | Waro Colombia</Title>
      <Meta
        property="og:title"
        v-bind="{ content: `Discotecas en Bogotá | Waro Colombia` }"
      />
      <Meta name="description" v-bind="{ content: `Descubre las mejores discotecas de Bogotá con promociones y ofertas increíbles. ¡Conoce más!` }" />
      <Meta property="og:description" v-bind="{ content: `Descubre las mejores discotecas de Bogotá con promociones y ofertas increíbles. ¡Conoce más!` }" />
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
