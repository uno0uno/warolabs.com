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
    videoSrc: {
        type: String,
        required: false,
        default: null
    },
    videoAlt: {
        type: String,
        default: 'Video'
    },
    videoWidth: {
        type: [String, Number],
        default: '800'
    },
    videoHeight: {
        type: [String, Number],
        default: '500'
    }
});
</script>

<template>
    <div class="flex flex-col lg:flex-row w-full h-full mx-auto py-4 lg:px-8 justify-left items-left xl:items-center gap-6">
        <!-- left container -->
        <div class="flex flex-col gap-4 xl:gap-4 text-left w-full lg:w-1/2 h-fit items-start justify-between">
            <p class="font-principal lg:text-sm xl:text-lg font-base leading-tight max-w-xl w-full text-stone-600">
                {{ description }}
            </p>
            <h2 class="text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-light text-black text-left w-full ">
                {{ title }}
            </h2>
            <button>
                <span class="text-lg font-semibold text-white bg-black px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300">
                    Únete a Nuestro Próximo Lab
                </span>
            </button>
        </div>
        <!-- right container -->
        <div class="flex w-full lg:w-1/2 h-full items-left justify-start lg:items-center lg:justify-center">
            <div class="flex items-center justify-center">
                <CommonsTheVideos
                    v-if="videoSrc"
                    :src="videoSrc"
                    :alt="videoAlt"
                    :width="videoWidth"
                    :height="videoHeight"
                />
                <p v-else>No video source provided.</p>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>