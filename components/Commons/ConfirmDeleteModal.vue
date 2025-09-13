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
                <UiCardTitle class="text-lg font-semibold">Confirmar Eliminación</UiCardTitle>
                <p class="text-sm text-muted-foreground">Esta acción no se puede deshacer</p>
              </div>
            </div>
          </UiCardHeader>

          <UiCardContent class="space-y-4">
            <div class="text-sm text-foreground">
              <p v-if="templateInfo.isPair" class="mb-3">
                ¿Estás seguro de que quieres eliminar el <strong>par de templates</strong> 
                "<strong>{{ templateInfo.name }}</strong>"?
              </p>
              <p v-else class="mb-3">
                ¿Estás seguro de que quieres eliminar el <strong>template</strong> 
                "<strong>{{ templateInfo.name }}</strong>" 
                (<strong>{{ templateInfo.typeLabel }}</strong>)?
              </p>

              <div v-if="templateInfo.isPair" class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div class="flex items-start gap-2">
                  <ExclamationTriangleIcon class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div class="text-xs text-amber-700 dark:text-amber-200">
                    <p class="font-medium mb-1">Esto eliminará ambos templates:</p>
                    <ul class="list-disc list-inside space-y-0.5">
                      <li>Template de Email</li>
                      <li>Template de Landing</li>
                    </ul>
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
              {{ loading ? 'Eliminando...' : 'Eliminar' }}
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
  templateInfo: {
    type: Object,
    default: () => ({
      name: '',
      isPair: false,
      typeLabel: ''
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['confirm', 'cancel']);
</script>