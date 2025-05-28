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
    <div class="flex flex-col lg:flex-row bg-white w-full h-full mx-auto py-4 lg:px-8 justify-center items-center gap-8 global-style">
        <!-- left container -->
        <div class="flex flex-col gap-6 text-left lg:w-1/2 h-fit items-start justify-between">
            <p class="text-xl font-light leading-light w-full text-stone-600">
                {{ description }}
            </p>
            <h2 class="text-4xl md:text-3xl lg:text-3xl xl:text-4xl font-bold leading-light text-black text-left w-full ">
                {{ title }}
            </h2>
            <button>
                <span class="text-lg font-semibold text-white bg-black px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300">
                    Únete a Nuestro Próximo Lab 
                </span>
            </button>

        </div>
        <!-- right container -->
        <div class="flex w-full lg:w-1/2 h-full items-center justify-center">
            <div class="flex items-center justify-center">
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
    </div>
</template>

<style scoped>

</style>