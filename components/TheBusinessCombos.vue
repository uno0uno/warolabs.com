<script setup>
const props = defineProps({
  promos: { type: Object },
});

const { promos } = toRefs(props);

function displayText(value) {
  return value.slice(0, 110) + '...';
}

async function openCombo(id, slug) {
  await navigateTo({ path: `/promociones/${slug}-PROM${id}` });
}
</script>

<template>
  <div
    class="
      grid grid-cols-1
      md:grid-cols-2
      lg:grid-cols-2
      xl:grid-cols-2
      gap-4
      md:px-0
      mt-4
    "
  >
    <div
      v-for="item in promos"
      :key="item.id"
      class="p-4 w-full h-full rounded-lg cursor-pointer bg-slate-100 border-2"
    >
      <div @click="openCombo(item.id, item.slug)" class="flex flex-col gap-2">
        <div class="">
          <p class="mb-0 text-2xl md:text-3xl font-bold text-slate-900">
            {{ item.name }}
          </p>
        </div>

        <div class="flex gap-2">
          <p class="text-m md:text-normal text-gray-900 text-text-subdued">
            {{ displayText(item.description) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
