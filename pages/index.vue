<template>
  <section class="relative flex-grow flex flex-col items-center justify-center text-center overflow-hidden">
    <!-- Ambient Glow - smaller on mobile -->
    <div class="absolute w-[400px] h-[300px] md:w-[800px] md:h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[60px] md:blur-[80px] -z-10 pointer-events-none glow transition-all duration-300"></div>

    <h1 class="font-display font-normal text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.15] tracking-tight mb-4 md:mb-6 max-w-[900px] text-hero-gradient transition-all duration-300">
      Hacemos <span class="font-sans font-black">software de verdad.</span>
      <br class="hidden sm:block" />
      <span class="sm:hidden"> </span>
      Exprimiendo las IAs más top del mundo.
    </h1>

    <p class="text-base sm:text-lg md:text-xl lg:text-[22px] max-w-[90%] sm:max-w-[700px] mb-8 md:mb-12 font-normal leading-relaxed text-secondary">
      Diseño + IA + Marketing. Súmate al lab open-source donde destripamos las herramientas del futuro para que LatAm la rompa.
    </p>

    <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
      <button class="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
        <span>Únete a nuestros Labs</span>
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M19 12l-7 7-7-7"></path>
        </svg>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
const {
  title,
  description,
  ogTitle,
  ogDescription,
  ogUrl,
  twitterTitle,
  twitterDescription,
  jsonLd
} = useSeo()

useSeoMeta({
  title,
  description,
  ogTitle,
  ogDescription,
  ogUrl,
  twitterTitle,
  twitterDescription
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(jsonLd)
    }
  ]
})
</script>
