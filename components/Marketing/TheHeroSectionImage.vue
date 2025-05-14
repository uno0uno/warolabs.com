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
    image: {
        type: Array,
        required: true,
    },
});


</script>

<template>
    <div class="flex flex-col md:flex-row bg-white w-full h-auto md:h-[20rem] max-w-5xl mx-auto py-4 md:px-8 justify-center items-center gap-8 global-style">
        <!-- left container -->
        <div class="flex flex-col gap-6 text-left md:w-1/2 h-full items-start justify-center">
            <p class="text-2xl font-light leading-relaxed w-full text-stone-600">
                {{ description }}
            </p>
            <h2 class="text-4xl font-bold leading-light text-black text-left w-full max-w-md">
                {{ title }}
            </h2>
            <button>
                <span class="text-lg font-semibold text-white bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300">
                    Call to Action
                </span>
            </button>

        </div>
        <!-- right container -->
        <div class="flex md:w-1/2 h-full bg-white">
            <CommonsTheImages
                v-for="(image, index) in image"
                :key="index"
                :src="image.src"
                :alt="image.alt"
                :width="image.width"
                :height="image.height"
                :lazy="image.lazy"
                :className="`${image.className} h-full object-cover`"
            />
        </div>
    </div>
</template>

<style scoped>

</style>