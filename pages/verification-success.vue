<script setup>
import { CheckCircleIcon } from '@heroicons/vue/24/solid';

definePageMeta({
  layout: 'landing', // Usamos el layout 'landing' para que tenga cabecera y pie de página
});

useHead({
  title: 'Email Verified Successfully | Waro Labs',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }] // Evita que esta página sea indexada por Google
});
</script>

<template>
  <div class="flex-grow flex items-center justify-center text-center">
    <div class="p-8 max-w-lg w-full">
      <CheckCircleIcon class="h-24 w-24 text-green-500 mx-auto" />
      <h1 class="text-4xl font-bold mt-4">¡Verificación Exitosa!</h1>
      <p class="text-lg text-gray-600 mt-2">
        Gracias por confirmar tu dirección de correo. Ya eres parte de la comunidad de Waro Labs. Si no ves nuestros correos, revisa también tu carpeta de spam.
      </p>
      <NuxtLink 
        to="/" 
        class="mt-8 inline-block bg-black text-white font-semibold px-6 py-3 rounded-md hover:bg-gray-800 transition-colors duration-300">
        Volver al Inicio
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>