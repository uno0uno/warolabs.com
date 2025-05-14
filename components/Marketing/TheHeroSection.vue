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
        class="flex flex-col gap-8 items-left lg:items-center justify-center min-h-[60vh] sm:min-h-[50vh] md:min-h-[70vh] text-left md:text-center bg-gray-100 max-w-5xl mx-auto global-style">
        <h1 class="text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-extrabold leading-none text-black">
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