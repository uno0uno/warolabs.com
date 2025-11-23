<template>
  <div class="min-h-screen flex flex-col antialiased overflow-x-hidden bg-dots bg-body text-main transition-colors duration-300">
    <!-- Mask for dot pattern fade -->
    <div class="fixed inset-0 pointer-events-none -z-10 mask-radial transition-all duration-300"></div>

    <TheHeader />

    <main class="flex-grow pt-[60px] sm:pt-[72px]">
      <slot />
    </main>

    <TheFooter />
  </div>
</template>

<script setup>
// El tema se maneja automáticamente por @nuxtjs/color-mode
// La clase 'dark' se aplica al <html> automáticamente
</script>
