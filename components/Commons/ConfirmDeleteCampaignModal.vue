<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Transition
        enter-active-class="transition-all duration-300 ease-out delay-100"
        enter-from-class="opacity-0 transform scale-95 -translate-y-4"
        enter-to-class="opacity-100 transform scale-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 transform scale-100 translate-y-0"
        leave-to-class="opacity-0 transform scale-95 -translate-y-4"
      >
        <UiCard v-if="show" class="w-full max-w-md border-2 border-destructive/20">
          <UiCardHeader>
            <div class="flex items-center gap-3">
              <div class="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-destructive/10">
                <ExclamationTriangleIcon class="w-6 h-6 text-destructive" />
              </div>
              <div>
                <UiCardTitle class="text-lg font-semibold">Eliminar Campaña</UiCardTitle>
                <p class="text-sm text-muted-foreground">Esta acción no se puede deshacer</p>
              </div>
            </div>
          </UiCardHeader>

          <UiCardContent class="space-y-4">
            <div class="text-sm text-foreground">
              <p class="mb-3">
                ¿Estás seguro de que quieres eliminar la campaña 
                "<strong>{{ campaignInfo.name }}</strong>"?
              </p>

              <div class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                <div class="flex items-start gap-2">
                  <ExclamationTriangleIcon class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div class="text-xs text-amber-700 dark:text-amber-200">
                    <p class="font-medium mb-1">Al eliminar esta campaña se perderán:</p>
                    <ul class="list-disc list-inside space-y-0.5">
                      <li>Todos los leads capturados ({{ campaignInfo.totalLeads }} leads)</li>
                      <li>Datos de analytics y métricas</li>
                      <li>Historial de emails enviados</li>
                      <li>Configuración de templates</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="bg-muted/50 rounded-lg p-3">
                <div class="text-xs text-muted-foreground space-y-1">
                  <div class="flex justify-between">
                    <span>Estado:</span>
                    <span class="font-medium">{{ getStatusLabel(campaignInfo.status) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Leads totales:</span>
                    <span class="font-medium">{{ campaignInfo.totalLeads }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Creada:</span>
                    <span class="font-medium">{{ formatDate(campaignInfo.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </UiCardContent>

          <UiCardFooter class="flex gap-3 justify-end border-t bg-muted/20">
            <UiButton variant="outline" @click="$emit('cancel')" :disabled="loading">
              Cancelar
            </UiButton>
            <UiButton 
              variant="destructive" 
              @click="$emit('confirm')" 
              :disabled="loading"
              class="flex items-center gap-2"
            >
              <div v-if="loading" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              {{ loading ? 'Eliminando...' : 'Eliminar Campaña' }}
            </UiButton>
          </UiCardFooter>
        </UiCard>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  campaignInfo: {
    type: Object,
    default: () => ({
      name: '',
      status: '',
      totalLeads: 0,
      createdAt: ''
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['confirm', 'cancel']);

const getStatusLabel = (status) => {
  const statusLabels = {
    draft: 'Borrador',
    active: 'Activa',
    paused: 'Pausada',
    completed: 'Completada'
  };
  return statusLabels[status] || status;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>