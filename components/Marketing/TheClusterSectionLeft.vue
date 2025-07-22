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
    items: {
        type: Array,
        required: true,
    },
});
</script>

<template>
    <div class="w-full h-full gap-4 lg:gap-16 flex flex-col mx-auto lg:px-8 justify-start lg:justify-center">
        <div class="flex flex-col gap-2 items-start lg:items-center lg:justify-center w-full">
            <h2 class="text-3xl md:text-3xl lg:text-4xl xl:text-5xl text-left lg:text-center font-bold text-black max-w-2xl">{{ description }}</h2>
        </div>
        <div class="grid lg:grid-cols-2 gap-4 w-full h-fit place-items-center">
            <div v-for="(item, index) in items" :key="index"
                class="flex flex-col gap-2 w-full h-fit border-2 border-slate-900 p-4 px-4 ">
                <div class="flex flex-caol md:flex-row gap-4 items-left"> 
                    <div class="flex items-center justify-center w-1/5 h-full">
                        <component :is="item.icon" class="h-18 w-18" />
                    </div>
                    <div class="flex flex-col gap-4 items-left justify-start text-left lg:w-4/5">
                        <h3 class="text-2xl font-bold leading-none text-stone-900">
                            {{ item.title }}
                        </h3>
                        <p class="font-principal text-xs font-base leading-relaxed text-stone-600">
                            {{ item.description }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>