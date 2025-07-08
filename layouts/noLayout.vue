<script setup>


</script>

<template>
  <div class="w-screen h-screen flex flex-col">

    <NuxtLoadingIndicator />
    <div class=" flex pb-2 px-4 md:px-16 2xl:px-[30rem] w-full h-full">
      <slot />
    </div>
  </div>
</template>
