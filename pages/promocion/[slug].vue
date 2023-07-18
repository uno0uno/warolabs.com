<script setup>

  const { slug } = useRoute().params;

  const counterAmountProduct =  ref(1);
  const priceProduct = ref(0);

  const { data: promoData, pending, refresh, execute, error } = await useAsyncData(
    'combo-data', 
    () => {
      try {
        return $fetch(`/api/promos/promoInfo?slug=${slug}`)
      } catch (error) {
        return error;
      }
    }
  )

  function increaseCounter() {
    counterAmountProduct.value++;
  }

  function decreaseCounter() {
    if (counterAmountProduct.value > 1) {
      counterAmountProduct.value--;
    }
  }

  function calculateTotalPrice(value) {
    return value * this.counterAmountProduct;
  }

  function formatPrice(price, currency) {
    const formatter = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      currencyDisplay: 'symbol',
    });
    return formatter.format(price);
  }

</script>

<template>

  <div v-if="pending">
    LOADING...
  </div>

  <div v-else-if="error">Error al cargar los datos: {{ error }}</div>
  
  <div v-else v-for="promo in promoData" :key="promo.name"
    class="flex flex-col gap-2 mx-auto max-h-full font-principal">
      <div class="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-4 md:gap-10">
          <div class="md:col-span-6 lg:col-span-7 flex flex-col gap-4 md:gap-4">
                  <TheProductDetail
                  v-bind:name_product="promo.name"
                  v-bind:night_club_info="promo.night_clubs"
                  >
                  </TheProductDetail>

                  <div class="flex  justify-between items-center">
                    <div class="flex justify-center">
                      <p class="text-2xl md:text-3xl font-bold font-rubik text-slate-600">
                        {{formatPrice(calculateTotalPrice(promo.price))}}
                      </p>
                    </div>
                    <button @click="decreaseCounter" class="w-1/6 text-m font-bold py-2 px-4 border-2 border-slate-200 text-slate-900 rounded-l-lg">
                      <span>-</span>
                    </button>
                    <div class="w-1/6 flex justify-center border-y-2 py-2 px-4">
                      {{ counterAmountProduct }}
                    </div>
                    <button @click="increaseCounter" class="w-1/6 text-m font-bold py-2 px-4 border-2 border-slate-200 text-slate-900 rounded-r-lg">
                      <span>+</span>
                    </button>
                  </div>

                <div class="flex justify-end items-center">
                    <button
                      class=" w-full text-m font-bold py-2 px-4 bg-slate-900 text-white rounded-lg">
                        <span>Reservar en 2 clicks</span>
                    </button>
                </div>

                  <TheProductInfo 
                  v-bind:reazon_sell_product="promo.description"
                  >
                  </TheProductInfo>
  
          </div>
                <TheProductImage
                v-bind:imgHash="promo.image"
                >
                </TheProductImage>
      </div>
  </div>

</template>


<style scoped>

</style>
