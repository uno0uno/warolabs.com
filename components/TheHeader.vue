<template>
  <header class="min-h-[60px] sm:min-h-[72px] py-3 sm:py-4 flex items-center justify-center z-50 glass border-b border-glass-border transition-all duration-300">
    <div class="w-full max-w-[1400px] mx-auto flex items-center justify-between gap-3 px-3 sm:px-4 md:px-6">
      <NuxtLink to="/" class="flex min-w-0 items-center gap-2 shrink-0">
        <img src="https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/logo_warolabs.webp" alt="Waro Labs" class="h-[22px] max-w-[96px] sm:h-[26px] sm:max-w-none w-auto flex-shrink-0" />
      </NuxtLink>

      <nav class="hidden md:flex items-center shrink-0">
        <ul class="flex items-center gap-1 md:gap-4">
          <li>
            <NuxtLink to="/blog" class="nav-link text-sm sm:text-[15px]">Blog</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/team" class="nav-link text-sm sm:text-[15px]">Team</NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-2 sm:gap-3 shrink-0 ms-auto md:ms-0">
        <a href="https://github.com/uno0uno/warolabs.com" target="_blank" rel="noopener" class="nav-link flex items-center" aria-label="GitHub">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-github"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
        </a>
      </div>
    </div>
  </header>
</template>

<script setup>
// const colorMode = useColorMode()

// const toggleTheme = () => {
//   colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
// }
</script>
