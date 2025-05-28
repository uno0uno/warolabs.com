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
        class="flex flex-col gap-16 items-center justify-center w-full max-w-5xl mx-auto py-6 px-8">
        <h1 class="max-w-2xl w-full text-left md:text-center w-auto h-auto">
            <span  class="text-4xl md:text-6xl font-bold text-black text-center !leading-[1.2]">
                {{ title }}
            </span>
        </h1>
        <button v-if="descriptionButton" class="self-center">
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