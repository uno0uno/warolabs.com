<template>
  <footer class="py-10 flex flex-col items-center justify-center mt-auto text-secondary border-t border-glass-border glass transition-all duration-300">
    <div class="w-full max-w-[1000px] flex flex-col items-center gap-5 text-xs">
      <div class="flex gap-5">
        <a href="https://github.com/uno0uno/warocol.com" target="_blank" rel="noopener" class="nav-link">Github</a>
        <a href="https://www.tiktok.com/@warocolombia" target="_blank" rel="noopener" class="nav-link">Tik Tok</a>
        <NuxtLink to="/blog" class="nav-link">Blog</NuxtLink>
      </div>
      <div>
        &copy; {{ currentYear }} Waro Labs. Todo el código es open source.
      </div>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>
