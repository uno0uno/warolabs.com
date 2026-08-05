<template>
  <section class="border-b border-glass-border bg-surface/40">
    <div class="public-page-container py-12 sm:py-16 lg:py-20 text-center">
      <p
        class="text-xs font-semibold uppercase tracking-[0.2em] text-accent animate-fade-in-up"
        style="animation-delay: 0.1s"
      >
        WARO Labs Blog
      </p>

      <h1
        class="mt-4 font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal leading-[1.15] tracking-tight text-main break-words animate-fade-in-up"
        style="animation-delay: 0.2s"
      >
        Aprende cómo hacemos software <span class="text-accent">con IA</span>
      </h1>

      <p
        class="mt-5 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-text-body animate-fade-in-up"
        style="animation-delay: 0.3s"
      >
        Abrimos nuestro proceso de creación open-source: guías para empresas, hackers y desarrolladores.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
