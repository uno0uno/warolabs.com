<template>
  <div class="flex-1 overflow-auto pt-4">
    <TheLoadingOverlay :show="loading" />
    
    <div v-if="loading" class="min-h-screen"></div>
    
    <div v-else>
      <CommonsEmptyState 
        icon-name="heroicons:chart-bar"
        title="Analíticas de Campañas"
        description="Próximamente - Métricas detalladas de rendimiento"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import TheLoadingOverlay from '@/components/Commons/TheLoadingOverlay.vue';

const loading = ref(true);

onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 500);
});
</script>