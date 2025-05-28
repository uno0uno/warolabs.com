<script setup>
defineProps({
    title: {
        type: String,
        required: true,
    },
    descriptionButton: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    orientation: {
        type: String,
        default: 'left',
    }
});
</script>

<template>
    <div
        class="flex flex-col gap-8 lg:gap-16 items-start justify-left lg:items-center lg:justify-center w-full h-full mx-auto py-6 px-8 bg-white">
        <h1 class="max-w-2xl w-full text-left lg:text-center w-auto h-auto">
            <span  class="text-4xl lg:text-5xl xl:text-6xl font-bold text-black">
                {{ title }} 
            </span>
        </h1>
        <button v-if="descriptionButton" class="self-left lg:self-center">
            <span
                class="text-lg font-semibold text-white bg-black px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300">
                Call to Action
            </span>
        </button>
        <p v-if="description" class="text-2xl font-light leading-relaxed max-w-xl text-stone-600">
            {{ description }}
        </p>
    </div>
</template>

<style scoped>

</style>