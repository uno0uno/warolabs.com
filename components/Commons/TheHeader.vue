<script setup>
import TheLogo from './TheLogo.vue';
import TheMenu from './TheMenu.vue';

</script>

<template>
  <div class="flex flex-col sm:flex-row gap-4 items-left justify-start lg:justify-center p-4 bg-black text-white sm:px-12 xl:px-12">
      <div class="flex flex-col sm:flex-row items-left md:items-center w-full h-full justify-between gap-4 md:gap-8 lg:min-w-[48rem] max-w-5xl">
          <TheLogo />
          <TheMenu />
      </div>
  </div>
</template>