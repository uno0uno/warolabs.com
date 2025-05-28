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
    <div class="w-full h-full bg-white gap-4 flex flex-col mx-auto py-10 px-8 ">
        <div class="flex flex-col gap-2 items-left justify-center text-left">
            <p class="text-2xl font-light leading-relaxed text-stone-800">{{ description }}</p>
            <h2 v-if="title" class="text-5xl font-bold text-black">{{ title }}</h2>
        </div>
        <div class="grid lg:grid-cols-2 gap-6 w-full h-full place-items-center">
            <div v-for="(item, index) in items" :key="index"
                class="flex flex-col gap-2 w-full h-fit bg-gray-100 rounded-lg p-4 px-4">
                <div class="flex gap-4 items-center">
                    <div class="flex items-center justify-center w-1/5 h-full">
                        <component :is="item.icon" class="h-18 w-18" />
                    </div>
                    <div class="flex flex-col gap-4 items-left justify-start text-left w-4/5">
                        <h3 class="text-xl font-extrabold leading-none text-black">
                            {{ item.title }}
                        </h3>
                        <p class="text-sm font-light leading-relaxed text-stone-600">
                            {{ item.description }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>