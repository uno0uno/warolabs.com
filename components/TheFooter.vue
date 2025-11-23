<template>
  <footer class="py-10 px-5 md:px-10 flex flex-col items-center gap-5 text-xs mt-auto text-secondary border-t border-glass-border transition-all duration-300">
    <NuxtLink to="/" class="font-display font-bold text-base text-main">waro labs</NuxtLink>
    <div class="flex gap-5">
      <a href="https://github.com/warolabs" target="_blank" rel="noopener" class="nav-link">Github</a>
      <a href="https://twitter.com/warolabs" target="_blank" rel="noopener" class="nav-link">Twitter</a>
      <NuxtLink to="/blog" class="nav-link">Blog</NuxtLink>
    </div>
    <div>
      &copy; {{ currentYear }} Waro Labs. Todo el código es open source.
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>
