<script setup>

const props = defineProps({
  reazon_sell_product: { type: String }
});

const reazon_sell_product = toRef(props, 'reazon_sell_product');
const showFullText = ref(false);

const displayText = computed(() => {
  if (showFullText.value) {
    return reazon_sell_product.value;
  } else {
    return reazon_sell_product.value.slice(0, 120) + '...';
  }
});

</script>

<template>
  <div class="flex justify-between items-center content-between rounded-t-lg p-4 bg-slate-100">
    <p class="text-m font-bold">Información:</p>
    <button v-if="!showFullText" class="text-sm md:text-lg font-bold text-left text-slate-900" @click="showFullText = true">+ Ver más</button>
    <button v-else class="text-sm md:text-lg text-left font-bold text-slate-900" @click="showFullText = false">- Ver menos</button>
  </div>
  <div class="flex flex-col mx-3">
    <p itemprop="description" class="text-slate-900 text-m" 
        v-for="(line, lineNumber) of displayText.split('\n')" 
        :key="lineNumber">
        {{ line }}<br/>
    </p>
  </div>
</template>
