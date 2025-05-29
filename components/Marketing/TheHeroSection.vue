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
        class="flex flex-col gap-8 items-left lg:items-center justify-center md:h-full text-left lg:text-center bg-white mx-auto global-style pt-8 ">
        <h1 class="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-7xl font-extrabold leading-none text-black">
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