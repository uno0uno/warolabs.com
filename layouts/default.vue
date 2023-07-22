<template>
  <div class="py-4">
    <header class="mx-auto py-4 px-4 md:px-16 lg:px-32 xl:px-32 2xl:px-[30rem]">
      <TheHeader />
    </header>

    <NuxtLoadingIndicator />

    <div class="mx-auto py-2 px-4 md:px-16 lg:px-32 xl:px-32 2xl:px-[30rem]">
      <slot />
    </div>

    <footer class="mx-auto px-4 md:px-16 lg:px-32 xl:px-32 2xl:px-[30rem]">
      <TheFooter />
    </footer>
  </div>
</template>

<script setup>
defineRobotMeta();
</script>
