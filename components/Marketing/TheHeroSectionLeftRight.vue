<script setup>
defineProps({
    title: {
        type: String,
        required: true,
    },
    descriptionButton: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    orientation: {
        type: String,
        default: 'left',
    }
});
</script>

<template>
    <div
        class="flex flex-col gap-8 items-left justify-start w-full text-left min-h-[12rem] bg-gray-100 max-w-5xl mx-auto  py-6 px-8">
        <h1 class="text-5xl font-extrabold leading-tight text-black text-left w-full max-w-lg ">
            {{ title }}
        </h1>
        <button v-if="descriptionButton" class="self-start">
            <span
                class="text-lg font-semibold text-white bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300">
                Call to Action 
            </span>
        </button>
        <p class="text-2xl font-light leading-relaxed max-w-xl text-stone-600">
            {{ description }}
        </p>
    </div>
</template>

<style scoped>
/* Si necesitas ajustes personalizados, puedes añadirlos aquí */
</style>