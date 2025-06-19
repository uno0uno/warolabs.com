<script setup>
defineProps({
    title: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    itemsImages: {
        type: Array,
        required: true,
    },
});
</script>

<template>
    <div class="w-full h-full gap-4 lg:gap-16 items-center lg:items-center lg:justify-center flex flex-col mx-auto">
        <div v-if="title && description" class="flex flex-col gap-4 items-start lg:items-center justify-start lg:justify-center text-left lg:text-center w-full">
            <p class="font-principal text-md sm:text-xl font-base leading-tight max-w-xl text-stone-600 lg:mb-2">{{ description }}</p>
            <h2 class="text-3xl leading-none md:text-4xl lg:text-5xl xl:text-6xl font-bold text-black max-w-xl">{{ title }}</h2>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full h-fit place-items-center">
            <CommonsTheImages v-for="(image, index) in itemsImages" borderColor="border-slate-900" :key="index" :src="image.src" :alt="image.alt"
                :width="image.width" :height="image.height" />
        </div>
    </div>
</template>
