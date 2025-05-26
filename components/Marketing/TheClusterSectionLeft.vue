<script setup>
defineProps({
    title: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: true,
    },
    itemsImages: {
        type: Array,
        required: true,
    },
});
</script>

<template>
    <div class="w-full h-full gap-8 flex flex-col py-4 px-8 items-left justify-start">
        <div class="flex flex-col gap-2 items-left justify-center text-left">
            <p class="text-2xl font-light leading-relaxed text-stone-800">{{ description }}</p>
            <h2 v-if="title" class="text-5xl font-bold text-black">{{ title }}</h2>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full h-fit place-items-center">
            <div v-for="(image, index) in itemsImages" :key="index" class="flex flex-col gap-2 w-full h-fit bg-white rounded-lg py-2 px-2" >
                <div class="flex gap-4 items-center h-fit w-full">
                    <div class="w-24">
                        <CommonsTheImages
                            :src="image.src"
                            :alt="image.alt"
                            :width="image.width"
                            :lazy="image.lazy"
                            :className="`${image.className} h-full object-cover`"           
                        />
                    </div>
                    <div class="flex flex-col items-left justify-start text-left">
                        <h3 class="text-lg font-bold leading-none text-black">
                            Header Section
                        </h3>
                        <p class="text-sm font-light leading-relaxed text-stone-600">
                            Header Section
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
