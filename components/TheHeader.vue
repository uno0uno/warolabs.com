<template>
  <header class="h-[60px] sm:h-[72px] py-6 sm:py-12 flex items-center justify-center z-50 glass border-b border-glass-border transition-all duration-300">
    <div class="w-full max-w-[1000px] flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2">
        <img src="https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/logo_warolabs.webp" alt="Waro Labs" class="h-12 sm:h-16 w-auto" />
      </NuxtLink>
      <nav>
        <ul class="flex items-center gap-4 sm:gap-6">
          <li>
            <NuxtLink to="/blog" class="nav-link text-sm sm:text-[15px]">Blog</NuxtLink>
          </li>
          
          <li>
            <NuxtLink to="/team" class="nav-link text-sm sm:text-[15px]">Team</NuxtLink>
          </li>

          <li>
            <a href="https://github.com/uno0uno/warolabs.com" target="_blank" rel="noopener" class="nav-link flex items-center" aria-label="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-github"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
          </li>
          <!-- 
          <li>
            <button @click="toggleTheme" class="theme-toggle" aria-label="Cambiar tema">
              <svg v-if="colorMode.value === 'light'" width="18" height="18" class="sm:w-5 sm:h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
              </svg>
              <svg v-else width="18" height="18" class="sm:w-5 sm:h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </button>
          </li>
          -->
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
// const colorMode = useColorMode()

// const toggleTheme = () => {
//   colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
// }
</script>
