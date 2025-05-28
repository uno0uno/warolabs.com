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
    <div class="global-style w-full h-full bg-white gap-8 lg:gap-16 items-center lg:items-center justify-center lg:justify-center flex flex-col py-4 mx-auto">
        <div v-if="title && description" class="flex flex-col gap-2 items-left lg:items-center justify-left lg:justify-center text-left lg:text-center">
            <p class="font-light leading-none text-stone-600 mb-2">{{ description }}</p>
            <h2 class="text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-black max-w-4xl">{{ title }}</h2>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full h-fit place-items-center">
            <CommonsTheImages v-for="(image, index) in itemsImages" :key="index" :src="image.src" :alt="image.alt"
                :width="image.width" :height="image.height" />
        </div>
    </div>
</template>
