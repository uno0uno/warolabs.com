<script setup>
defineProps({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    itemsImages: {
        type: Array,
        required: true,
    },
});
</script>

<template>
    <div :class="title && description ? 'md:min-h-[60vh]': 'min-h-[48vh]'" class="global-style w-full h-full bg-gray-100 gap-8 items-center justify-center flex flex-col py-4 max-w-5xl mx-auto ">
        <div v-if="title && description" class="flex flex-col gap-2 items-left md:items-center justify-left md:justify-center text-left md:text-center">
            <p class="font-light leading-relaxed text-stone-600 mb-2">{{ description }}</p>
            <h2 class="text-4xl md:text-6xl font-bold text-black">{{ title }}</h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 w-full h-full place-items-center">
            <CommonsTheImages v-for="(image, index) in itemsImages" :key="index" :src="image.src" :alt="image.alt"
                :width="image.width" :height="image.height" />
        </div>
    </div>
</template>
