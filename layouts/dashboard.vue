<template>
  <div class="flex flex-col h-screen">
    <header class="bg-gray-800 text-white p-4">
      <TheHeader />
    </header>

    <div class="flex flex-1">
      <aside class="w-64 bg-gray-700 text-white p-4">
        <TheMenu />
      </aside>

      <main class="flex-1 bg-gray-600 p-6">
        <slot />
      </main>
    </div>

    <footer class="bg-gray-800 text-white p-4">
      <TheFooter />
    </footer>
  </div>
</template>