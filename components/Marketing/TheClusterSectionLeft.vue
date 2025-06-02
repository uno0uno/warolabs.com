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
    items: {
        type: Array,
        required: true,
    },
});
</script>

<template>
    <div class="w-full h-full gap-4 flex flex-col mx-auto py-10 lg:px-8 global-style justify-center">
        <div class="flex flex-col gap-2 items-left justify-center text-left">
            <p class="font-principal text-lg sm:text-2xl font-base leading-relaxed max-w-lg text-stone-600">{{ description }}</p>
            <h2 v-if="title" class="text-5xl font-bold text-black">{{ title }}</h2>
        </div>
        <div class="grid lg:grid-cols-2 gap-6 w-full h-fit place-items-center">
            <div v-for="(item, index) in items" :key="index"
                class="flex flex-col gap-2 w-full h-fit bg-white rounded-lg p-4 px-4">
                <div class="flex flex-caol md:flex-row gap-4 items-left"> 
                    <div class="flex items-center justify-center w-1/5 h-full">
                        <component :is="item.icon" class="h-18 w-18" />
                    </div>
                    <div class="flex flex-col gap-4 items-left justify-start text-left lg:w-4/5">
                        <h3 class="text-2xl font-extrabold leading-none text-stone-900">
                            {{ item.title }}
                        </h3>
                        <p class="font-principal text-sm font-base leading-relaxed text-stone-600">
                            {{ item.description }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>