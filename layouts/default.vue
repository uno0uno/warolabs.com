<template>
  <div class="min-h-screen flex flex-col antialiased overflow-x-hidden bg-dots bg-body text-main transition-colors duration-300">
    <!-- Mask for dot pattern fade -->
    <div class="fixed inset-0 pointer-events-none -z-10 mask-radial transition-all duration-300"></div>

    <div class="flex flex-col w-full min-h-screen px-4 md:px-16 2xl:px-[30rem]">
      <TheHeader />

      <main class="flex-grow">
        <slot />
      </main>

      <TheFooter />
    </div>
  </div>
</template>

<script setup>
// El tema se maneja automáticamente por @nuxtjs/color-mode
// La clase 'dark' se aplica al <html> automáticamente
</script>
