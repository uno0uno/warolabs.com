<template>
  <UiButton
    variant="ghost"
    size="icon"
    @click="toggleTheme"
    class="h-8 w-8"
  >
    <SunIcon v-if="colorMode.preference === 'dark'" class="h-4 w-4" />
    <MoonIcon v-else class="h-4 w-4" />
  </UiButton>
</template>

<script setup>
import { SunIcon, MoonIcon } from 'lucide-vue-next'

const colorMode = useColorMode()

const toggleTheme = () => {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}
</script>