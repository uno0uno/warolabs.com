<template>
  <div class="min-w-screen min-h-screen w-full flex flex-col">

    <NuxtLoadingIndicator />

    <CommonsTheHeader />

    <div class="flex-grow flex flex-col justify-center sm:px-4 md:px-16 w-full py-8">
      <slot />
    </div>

    <CommonsTheFooter />

    <!-- Toast Provider -->
    <CommonsToastProvider />

  </div>
</template>

<script setup>

</script>