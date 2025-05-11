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
    <div class="hero-section flex flex-col gap-8 items-center justify-center min-h-[60vh] text-center bg-gray-100 max-w-5xl mx-auto global-style">
        <h1 class="text-8xl font-extrabold leading-none text-black">
            {{ title }}
        </h1>
        <p class="text-2xl font-light leading-relaxed max-w-xl text-stone-600">
            {{ description }}
        </p>
    </div>
</template>

<style scoped>
/* Si necesitas ajustes personalizados, puedes añadirlos aquí */
</style>