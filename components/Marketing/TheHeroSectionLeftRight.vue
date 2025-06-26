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
        class="flex flex-col gap-8 lg:gap-16 items-start justify-left lg:items-center lg:justify-center w-full h-full mx-auto lg:py-6 lg:px-8">
        <h2 class="max-w-3xl w-full text-left lg:text-center h-auto">
            <span  class="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-black italic">
                {{ title }}
            </span>
        </h2>
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