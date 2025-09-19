<script setup>
// Add landing-page class to body for font style exception
onMounted(() => {
  document.body.classList.add('landing-page')
})

onUnmounted(() => {
  document.body.classList.remove('landing-page')
})
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
