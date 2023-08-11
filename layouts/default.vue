<template>
  <div class="pb-4">
    <header class=" flex flex-col gap-4 mx-auto py-4 px-4 md:px-16 lg:px-32 xl:px-32 2xl:px-[30rem]">
      <PublicTheHeader />
    </header>

    <NuxtLoadingIndicator />

    <div class="pb-2 px-4 md:px-16 lg:px-32 xl:px-32 2xl:px-[30rem]">
      <slot />
    </div>

    <footer class="mx-auto px-4 md:px-16 lg:px-32 xl:px-32 2xl:px-[30rem]">
      <UserTheFooter />
    </footer>
  </div>
</template>

<script setup>
defineRobotMeta();
</script>
