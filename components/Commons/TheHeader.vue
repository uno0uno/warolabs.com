<script setup>
import TheLogo from './TheLogo.vue';
import TheMenu from './TheMenu.vue';

</script>

<template>
    <div class="flex gap-4 items-center justify-start lg:justify-center p-4 bg-black text-white sm:px-12 xl:px-12">
        <div class="flex flex-col lg:flex-row items-start lg:items-center w-full h-full justify-start lg:justify-between gap-8 lg:min-w-[48rem] max-w-6xl">
            <TheLogo />
            <TheMenu />
        </div>
    </div>
</template>