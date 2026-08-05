<template>
  <section class="border-b border-glass-border bg-surface/40">
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <p
        class="text-xs font-semibold uppercase tracking-[0.2em] text-accent animate-fade-in-up"
        style="animation-delay: 0.1s"
      >
        WARO Labs Blog
      </p>

      <h1
        class="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.2] tracking-tight text-main max-w-3xl animate-fade-in-up"
        style="animation-delay: 0.2s"
      >
        Conocimiento accionable sobre <span class="text-accent">IA y software a medida</span>
      </h1>

      <p
        class="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-text-body animate-fade-in-up"
        style="animation-delay: 0.3s"
      >
        Artículos prácticos para empresas que quieren automatizar procesos, implementar IA y construir software que realmente se ajuste a su operación.
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
