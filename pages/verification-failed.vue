<script setup>
import { XCircleIcon } from '@heroicons/vue/24/solid';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

definePageMeta({
  layout: 'landing',
});

useHead({
  title: 'Email Verification Failed | Waro Labs',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
});

const route = useRoute();

// Mapea los códigos de error de la URL a mensajes amigables
const errorMessages = {
  invalid_token: 'El enlace de verificación que usaste no es válido. Por favor, intenta registrarte de nuevo.',
  expired_link: 'Este enlace de verificación ya ha sido utilizado o ha expirado.',
  server_error: 'Hubo un problema en nuestro servidor al intentar verificar tu correo. Por favor, inténtalo más tarde.',
  default: 'Ocurrió un error inesperado durante la verificación.'
};

// Determina qué mensaje mostrar basado en el parámetro 'error' de la URL
const errorMessage = computed(() => {
  const errorCode = route.query.error;
  return errorMessages[errorCode] || errorMessages.default;
});
</script>

<template>
  <div class="flex-grow flex items-center justify-center text-center">
    <div class="p-8 max-w-lg w-full">
      <XCircleIcon class="h-24 w-24 text-red-500 mx-auto" />
      <h1 class="text-4xl font-bold mt-4">Error en la Verificación</h1>
      <p class="text-lg text-gray-600 mt-2">
        {{ errorMessage }}
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