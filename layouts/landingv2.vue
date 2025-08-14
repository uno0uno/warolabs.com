<script setup>


</script>

<template>
  <div class="min-w-screen min-h-screen h-fit w-full flex flex-col justify-between">

    <NuxtLoadingIndicator />

    <CommonsTheHeader />

    <div class="pb-2 sm:px-4 md:px-16 w-full h-full">
      <slot />
    </div>

    <CommonsTheFooter />

  </div>
</template>
