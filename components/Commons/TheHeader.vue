<script setup>
import TheLogo from './TheLogo.vue';
import TheMenu from './TheMenu.vue';

</script>

<template>
    <div class="flex gap-4 items-center justify-center p-4 bg-black text-white">
        <div class="flex items-center w-full h-full justify-between gap-8 lg:px-12 lg:min-w-[48rem] max-w-6xl">
            <TheLogo />
            <TheMenu />
        </div>
    </div>
</template>