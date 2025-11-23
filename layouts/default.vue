<template>
  <div :class="{ dark: isDark }" class="min-h-screen flex flex-col antialiased overflow-x-hidden bg-dots bg-body text-main transition-colors duration-300">
    <!-- Mask for dot pattern fade -->
    <div class="fixed inset-0 pointer-events-none -z-10 mask-radial transition-all duration-300"></div>

    <TheHeader :isDark="isDark" @toggleTheme="toggleTheme" />

    <main class="flex-grow pt-[60px] sm:pt-[72px]">
      <slot />
    </main>

    <TheFooter />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const isDark = ref(true)

const toggleTheme = () => {
  isDark.value = !isDark.value
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
})

watch(isDark, (newValue) => {
  localStorage.setItem('theme', newValue ? 'dark' : 'light')
})
</script>
