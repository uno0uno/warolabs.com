<template>
  <div class="blog-layout min-h-screen bg-body bg-dots text-main">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-glass-border z-40 backdrop-blur-md">
      <div class="h-full px-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <!-- Mobile menu toggle -->
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="lg:hidden p-2 hover:bg-glass rounded transition-colors"
            aria-label="Toggle menu"
          >
            <Bars3Icon class="w-6 h-6" />
          </button>

          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2">
            <img src="https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/logo_warolabs.webp" alt="Waro Labs" class="h-10 sm:h-12 w-auto" />
          </NuxtLink>
        </div>

        <div class="flex items-center gap-6">
          <!-- Nav Desktop with Icons -->
          <nav class="hidden md:flex gap-5 items-center text-secondary">
            <!-- Docs Icon -->
            <NuxtLink to="/blog" class="text-main hover:text-accent transition transform hover:scale-110" title="Documentación">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </NuxtLink>
            
            <!-- GitHub Icon -->
            <a href="https://github.com/uno0uno/warolabs.com" target="_blank" rel="noopener" class="hover:text-main transition transform hover:scale-110" title="GitHub">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
              </svg>
            </a>
            
            <!-- X / Twitter Icon -->
            <a href="https://twitter.com/warolabs" target="_blank" rel="noopener" class="hover:text-main transition transform hover:scale-110" title="X (Twitter)">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </nav>

          <!-- Mobile menu button -->
          <button class="md:hidden text-secondary hover:text-main">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Main content with sidebars -->
    <div class="pt-16 flex">
      <!-- Left Sidebar - Navigation -->
      <aside
        :class="[
          'fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-surface border-r border-glass-border overflow-y-auto z-30 transition-transform',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]"
      >
        <BlogSidebar @navigate="sidebarOpen = false" />
      </aside>

      <!-- Overlay for mobile -->
      <div
        v-if="sidebarOpen"
        @click="sidebarOpen = false"
        class="fixed inset-0 bg-black/50 z-20 lg:hidden"
      ></div>

      <!-- Main content area -->
      <main class="flex-1 min-w-0 xl:mr-64">
        <div class="max-w-4xl mx-auto px-6 py-8">
          <slot />
        </div>
      </main>

      <!-- Right Sidebar - Table of Contents -->
      <aside class="hidden xl:block w-64 fixed right-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto border-l border-glass-border bg-surface px-4 py-6">
        <BlogTOC />
      </aside>
    </div>
  </div>
</template>

<script setup>
import { Bars3Icon } from '@heroicons/vue/24/outline'

const sidebarOpen = ref(false)

// Close sidebar on route change
const route = useRoute()
watch(() => route.path, () => {
  sidebarOpen.value = false
})
</script>

<style scoped>
/* Custom scrollbar for sidebars */
aside::-webkit-scrollbar {
  width: 6px;
}

aside::-webkit-scrollbar-track {
  background: transparent;
}

aside::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 3px;
}

aside::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
</style>
