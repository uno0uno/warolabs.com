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
        <UiCard v-if="show" class="w-full max-w-lg border-2 border-amber-200">
          <UiCardHeader>
            <div class="flex items-center gap-3">
              <div class="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-amber-100">
                <ExclamationTriangleIcon class="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <UiCardTitle class="text-lg font-semibold text-amber-900">No se puede eliminar</UiCardTitle>
                <p class="text-sm text-amber-700">Esta campaña contiene datos importantes</p>
              </div>
            </div>
          </UiCardHeader>

          <UiCardContent class="space-y-4">
            <div class="text-sm text-foreground">
              <p class="mb-3">
                La campaña "<strong>{{ campaignName }}</strong>" no se puede eliminar porque contiene:
              </p>

              <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div class="space-y-2">
                  <div v-if="data.leads > 0" class="flex items-center justify-between">
                    <span class="flex items-center gap-2">
                      <UsersIcon class="w-4 h-4 text-amber-600" />
                      Leads capturados:
                    </span>
                    <span class="font-semibold text-amber-800">{{ data.leads }}</span>
                  </div>
                  
                  <div v-if="data.opens > 0" class="flex items-center justify-between">
                    <span class="flex items-center gap-2">
                      <EnvelopeOpenIcon class="w-4 h-4 text-amber-600" />
                      Emails abiertos:
                    </span>
                    <span class="font-semibold text-amber-800">{{ data.opens }}</span>
                  </div>
                  
                  <div v-if="data.clicks > 0" class="flex items-center justify-between">
                    <span class="flex items-center gap-2">
                      <CursorArrowRaysIcon class="w-4 h-4 text-amber-600" />
                      Clicks registrados:
                    </span>
                    <span class="font-semibold text-amber-800">{{ data.clicks }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-start gap-2">
                  <InformationCircleIcon class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div class="text-sm text-blue-700">
                    <p class="font-medium mb-2">¿Qué puedes hacer en su lugar?</p>
                    <ul class="list-disc list-inside space-y-1">
                      <li><strong>Pausar la campaña</strong> para detener nuevas conversiones</li>
                      <li><strong>Cambiar a estado "Completada"</strong> para archivarla</li>
                      <li><strong>Exportar los datos</strong> antes de considerar la eliminación</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </UiCardContent>

          <UiCardFooter class="flex gap-3 justify-end border-t bg-muted/20">
            <UiButton variant="outline" @click="$emit('close')">
              Entendido
            </UiButton>
            <UiButton @click="$emit('pauseCampaign')" class="bg-amber-600 hover:bg-amber-700">
              Pausar Campaña
            </UiButton>
          </UiCardFooter>
        </UiCard>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { 
  ExclamationTriangleIcon, 
  UsersIcon,
  EnvelopeOpenIcon,
  CursorArrowRaysIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline';

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  campaignName: {
    type: String,
    default: ''
  },
  data: {
    type: Object,
    default: () => ({
      leads: 0,
      opens: 0,
      clicks: 0
    })
  }
});

defineEmits(['close', 'pauseCampaign']);
</script>