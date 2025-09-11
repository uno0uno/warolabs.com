<template>
  <div class="flex-1 overflow-auto pt-4 flex items-center justify-center min-h-[calc(100vh-150px)] bg-background-light dark:bg-gray-800">
    <div class="text-center text-muted-foreground p-6 rounded-lg shadow-lg bg-card dark:bg-gray-700">
      <h3 class="text-xl font-bold mb-3" style="font-family: 'Lato', sans-serif;">
        ¡Bienvenido a Campañas de Email!
      </h3>
      <p class="mb-5 text-gray-600 dark:text-gray-300">
        Redirigiendo a la página de envío...
      </p>
      
      <button 
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium 
               ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 
               focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none 
               disabled:opacity-50 bg-black text-white hover:bg-gray-800 h-10 px-4 py-2"
      >
        Ir ahora
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

// El layout es heredado de email-campaigns.vue, no se necesita definir aquí.

onMounted(() => {
  const router = useRouter();
  // Redirige después de 2 segundos (2000 milisegundos)
  setTimeout(() => {
    router.push('/dashboard/email-campaigns/sender');
  }, 2000);
});
</script>

<style scoped>
.bg-background-light {
  background-color: #f8f9fa; /* Un color de fondo claro */
}
</style>