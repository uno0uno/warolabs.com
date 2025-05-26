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
});
</script>

<template>
    <div
        class="flex flex-col gap-8 items-left lg:items-center justify-center md:h-full text-left md:text-center mx-auto global-style pt-8 sm:p-0">
        <h1 class="text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-8xl 3xl:text-8xl font-extrabold leading-none text-black">
            {{ title }}
        </h1>
        <p class="text-lg sm:text-2xl font-light leading-relaxed max-w-xl text-stone-600">
            {{ description }}
        </p>
    </div>
</template>

<style scoped>
/* Si necesitas ajustes personalizados, puedes añadirlos aquí */
</style>