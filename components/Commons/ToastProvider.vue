<template>
  <Teleport to="body">
    <Toaster 
      position="bottom-right" 
      :expand="false" 
      :richColors="false" 
      :closeButton="false"
      :visibleToasts="5"
      :theme="'light'"
      :toastOptions="{
        duration: 5000,
        dismissible: true,
        style: {
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding: '0',
          margin: '8px 0'
        }
      }"
      class="!fixed !bottom-4 !right-4 !z-[9999]"
    />
  </Teleport>
</template>

<script setup>
import { Toaster } from 'vue-sonner'
</script>

<style>
/* Estilos mínimos para toasts personalizados */
[data-sonner-toaster] {
  z-index: 9999 !important;
}

[data-sonner-toast] {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}
</style>