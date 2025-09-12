<template>
  <div class="flex-1 overflow-auto pt-4">
    <TheLoadingOverlay :show="loading" />
    
    <div v-if="loading" class="min-h-screen"></div>
    
    <div v-else>
      <UiCard>
        <UiCardContent class="p-6">
          <div class="text-center text-muted-foreground">
            <div class="mx-auto h-12 w-12 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <div class="w-6 h-6 bg-gray-600 rounded"></div>
            </div>
            <h3 class="text-lg font-medium" style="font-family: 'Lato', sans-serif;">Gestión de Base de Datos</h3>
            <p>Próximamente - Herramientas de administración de datos</p>
          </div>
        </UiCardContent>
      </UiCard>
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
  }, 400);
});
</script>