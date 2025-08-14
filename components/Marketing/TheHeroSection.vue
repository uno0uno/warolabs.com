<script setup>

const props =  defineProps({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});

const { title, description} = toRefs(props);

const formattedTitle = computed(() => {
  const titleText = title.value || '';
  const phraseToItalicize = 'inteligencia artificial';
  if (titleText.includes(phraseToItalicize)) {
    return titleText.replace(phraseToItalicize, `<span class="italic">${phraseToItalicize}</span>`);
  }
  return titleText;
});

</script>

<template>
    <div
        class="flex flex-col gap-6 items-left lg:items-center justify-center md:h-full text-left lg:text-center mx-auto pt-8">
        <h1 class=" font-secondary font-bold text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-7xl leading-none text-stone-900"
            v-html="formattedTitle">
        </h1>
        <p class="font-principal text-md sm:text-xl font-base leading-tight max-w-xl text-stone-600">
            {{ description }}
        </p>
    </div>
</template>

<style scoped>
/* Si necesitas ajustes personalizados, puedes añadirlos aquí */
</style>