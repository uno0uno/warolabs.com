<script setup>


</script>

<template>
  <div class="w-screen h-fit flex flex-col">

    <NuxtLoadingIndicator />

    <CommonsTheHeader />

    <div class="pb-2 px-4 md:px-16 w-full h-full">
      <slot />
    </div>

    <CommonsTheFooter />

  </div>
</template>
