<template>
  <header class="h-[60px] sm:h-[72px] flex items-center justify-center z-50 glass border-b border-glass-border transition-all duration-300">
    <div class="w-full max-w-[1000px] flex items-center justify-between">
      <NuxtLink to="/" class="font-display font-bold text-lg sm:text-xl tracking-tight flex items-center gap-2 text-main">
        waro labs<span class="terminal-cursor"></span>
      </NuxtLink>
      <nav>
        <ul class="flex items-center gap-4 sm:gap-6">
          <li>
            <NuxtLink to="/blog" class="nav-link text-sm sm:text-[15px]">Blog</NuxtLink>
          </li>
          <li>
            <button @click="toggleTheme" class="theme-toggle" aria-label="Cambiar tema">
              <!-- Moon Icon (mostrar en light mode para cambiar a dark) -->
              <svg v-if="colorMode.value === 'light'" width="18" height="18" class="sm:w-5 sm:h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
              </svg>
              <!-- Sun Icon (mostrar en dark mode para cambiar a light) -->
              <svg v-else width="18" height="18" class="sm:w-5 sm:h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
const colorMode = useColorMode()

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
