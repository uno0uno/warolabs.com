<script setup>

const { idCombo } = useRoute().params;

const counterAmountProduct =  ref(1);
const priceProduct = ref(0);

const body = reactive ({
  currency: "",
  order_creation_location: [],
  merchant: [
    {
      amount: "",
      quantity: counterAmountProduct.value,
      combo_id : idCombo,
    }
  ]
});

const { data: comboData, pending, refresh, execute, error } = await useAsyncData(
  'combo-data', 
  () => {
    try {
      return $fetch(`/api/businessCombo/magicV1?idCombo=${idCombo}`);
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

const totalPrice = computed(() => {
  const total = counterAmountProduct.value * toRaw(comboData.value.price);
  body.merchant[0].amount = total;
  return total
});

if(!error){
  useSeoMeta({
    title: () => `${toRaw(comboData.value.name)} - ${toRaw(comboData.value.citie)}`,
    ogTitle: () => `${toRaw(comboData.value.name)} - ${toRaw(comboData.value.citie)} `,
    description: () => `${toRaw(comboData.value.reazon_sell_product)}`,
    ogDescription: () => `${toRaw(comboData.value.reazon_sell_product)}`,
    ogImage: 'https://dummyimage.com/1200x800/e600e6/ffffff',
    twitterCard: 'summary_large_image',
  })
}
</script>


<template>

  <div v-if="pending">
      LOADING...
  </div>

  <div v-else-if="error">Error al cargar los datos: {{ error }}</div>

    <div v-else  class="flex flex-col gap-2 mx-auto max-h-full font-principal">
        <div class="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-4 md:gap-10">
            <div class="md:col-span-6 lg:col-span-7 flex flex-col gap-4 md:gap-4">
                    <TheProductDetail
                    v-bind:name_product="comboData.name"
                    v-bind:citie_product="comboData.citie"
                    v-bind:address_product="comboData.address"
                    >
                    </TheProductDetail>

                    <div class="flex  justify-between items-center">
                      <div class="flex justify-center">
                        <p class="text-2xl md:text-3xl font-bold font-rubik text-slate-600">
                          $ {{ totalPrice }} USD 
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
                          <span>Pagar en 3 clicks</span>
                      </button>
                  </div>

                    <TheProductInfo 
                    v-bind:reazon_sell_product="comboData.reazon_sell_product"
                    >
                    </TheProductInfo>
    
            </div>

            <TheProductImage
            v-bind:imgHash="comboData.imgHash"
            >
            </TheProductImage>
  

        </div>
    </div>

</template>


<style scoped>

</style>
