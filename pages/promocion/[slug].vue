<script setup>

const { slug } = useRoute().params;

const counterAmountProduct =  ref(1);
const priceProduct = ref(0);

const body = reactive ({
  currency: "",
  order_creation_location: [],
  merchant: [
    {
      amount: "",
      quantity: counterAmountProduct.value,
      combo_id : slug,
    }
  ]
});

const { data: comboData, pending, refresh, execute, error } = await useAsyncData(
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

const totalPrice = computed(() => {
  const total = counterAmountProduct.value * toRaw(comboData.value.price);
  body.merchant[0].amount = total;
  return total
});

</script>


<template>
  <div v-if="pending">
      LOADING...
  </div>

  <div v-else-if="error">Error al cargar los datos: {{ error }}</div>


</template>


<style scoped>

</style>
