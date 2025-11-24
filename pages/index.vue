<template>
  <section class="relative flex-grow flex flex-col items-center justify-center text-center overflow-hidden">
    <!-- Ambient Glow - smaller on mobile -->
    <div class="absolute w-[400px] h-[300px] md:w-[800px] md:h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[60px] md:blur-[80px] -z-10 pointer-events-none glow transition-all duration-300"></div>

    <h1 class="font-display font-normal text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.15] tracking-tight mb-4 md:mb-6 max-w-[900px] text-hero-gradient transition-all duration-300">
      {{ heroTitle }} <span class="font-sans font-black text-accent-lime text-gradient-reset">{{ heroTitleHighlight }}</span>
      <br class="hidden sm:block" />
    </h1>

    <p class="text-base sm:text-lg md:text-xl lg:text-[22px] max-w-[90%] sm:max-w-[700px] mb-8 md:mb-12 font-normal leading-relaxed text-secondary">
      {{ heroDescription }}
    </p>

    <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
      <button class="flex items-center justify-center gap-2 w-full sm:w-auto btn-accent">
        <span>Únete a nuestros Labs</span>
        <ArrowRightIcon class="w-5 h-5" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRightIcon } from '@heroicons/vue/24/outline'

const {
  title,
  description,
  ogTitle,
  ogDescription,
  ogUrl,
  twitterTitle,
  twitterDescription,
  jsonLd,
  heroTitle,
  heroTitleHighlight,
  heroDescription
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
