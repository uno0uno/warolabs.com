<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="modal-overlay flex items-center justify-center p-4">
      <Transition
        enter-active-class="transition-all duration-300 ease-out delay-100"
        enter-from-class="opacity-0 transform scale-95 -translate-y-4"
        enter-to-class="opacity-100 transform scale-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 transform scale-100 translate-y-0"
        leave-to-class="opacity-0 transform scale-95 -translate-y-4"
      >
        <div v-if="show" class="modal-content max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
          <div class="modal-header">
            <div>
              <h2 class="modal-title flex items-center gap-2">
                <Icon name="heroicons:user-group" class="w-5 h-5 text-primary" />
                Crear Grupo de Leads
              </h2>
              <p class="text-sm text-muted-foreground">Segmenta tus leads basándote en métricas de engagement</p>
            </div>
            <button @click="$emit('close')" class="action-button">
              <Icon name="heroicons:x-mark" class="w-4 h-4" />
            </button>
          </div>

          <div class="modal-body space-y-6">
            <!-- Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-2">
                  Nombre del Grupo *
                </label>
                <input
                  v-model="formData.group_name"
                  placeholder="Ej: Leads Altamente Comprometidos"
                  class="input-base"
                />
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-2">
                  Descripción
                </label>
                <textarea
                  v-model="formData.group_description"
                  placeholder="Describe el propósito de este grupo..."
                  class="input-base resize-none"
                  rows="2"
                ></textarea>
              </div>
            </div>

            <!-- Filters -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Criterios de Segmentación</h3>
              
              <!-- Engagement Metrics -->
              <div class="bg-muted/50 p-4 rounded-lg mb-4">
                <h4 class="font-medium mb-3">Métricas de Engagement</h4>
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-1">
                      Interacciones Mínimas
                    </label>
                    <input
                      v-model.number="formData.filters.min_interactions"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="input-base"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-1">
                      Aperturas Mínimas
                    </label>
                    <input
                      v-model.number="formData.filters.min_opens"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="input-base"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-1">
                      Clicks Mínimos
                    </label>
                    <input
                      v-model.number="formData.filters.min_clicks"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="input-base"
                    />
                  </div>
                </div>
              </div>

              <!-- Source Filters -->
              <div class="bg-muted/50 p-4 rounded-lg mb-4">
                <h4 class="font-medium mb-3">Origen del Tráfico</h4>
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-1">
                      Fuente (Source)
                    </label>
                    <select
                      v-model="formData.filters.source"
                      class="input-base"
                    >
                      <option value="">Todas</option>
                      <option value="google">Google</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="direct">Directo</option>
                      <option value="email">Email</option>
                      <option value="organic">Orgánico</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-1">
                      Medio (Medium)
                    </label>
                    <select
                      v-model="formData.filters.medium"
                      class="input-base"
                    >
                      <option value="">Todos</option>
                      <option value="cpc">CPC</option>
                      <option value="organic">Orgánico</option>
                      <option value="social">Social</option>
                      <option value="email">Email</option>
                      <option value="referral">Referido</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-1">
                      Campaña
                    </label>
                    <select
                      v-model="formData.filters.campaign"
                      class="input-base"
                    >
                      <option value="">Todas las campañas</option>
                      <option v-for="campaign in availableCampaigns" :key="campaign.id" :value="campaign.slug">
                        {{ campaign.name }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Lead Status -->
              <div class="bg-muted/50 p-4 rounded-lg">
                <h4 class="font-medium mb-3">Estado del Lead</h4>
                <div class="flex gap-6">
                  <label class="flex items-center">
                    <input
                      v-model="formData.filters.is_verified"
                      type="checkbox"
                      class="mr-2 rounded text-primary"
                    />
                    <span class="text-sm">Solo verificados</span>
                  </label>
                  
                  <label class="flex items-center">
                    <input
                      v-model="formData.filters.is_converted"
                      type="checkbox"
                      class="mr-2 rounded text-primary"
                    />
                    <span class="text-sm">Solo convertidos</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Preview -->
            <div v-if="previewData" class="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 class="font-medium mb-2">Vista Previa</h4>
              <p class="text-sm text-muted-foreground">
                Este grupo incluirá aproximadamente 
                <span class="font-semibold text-primary">{{ previewData.estimated_count || 0 }}</span> leads
                basándose en los criterios seleccionados.
              </p>
            </div>

          </div>
          
          <!-- Actions -->
          <div class="modal-footer">
            <button @click="$emit('close')" class="btn-outline">
              Cancelar
            </button>
            <button 
              @click="previewGroup"
              :disabled="loading"
              class="btn-secondary"
            >
              <div v-if="loading" class="loading-spinner mr-2"></div>
              Vista Previa
            </button>
            <button 
              @click="createGroup"
              :disabled="!formData.group_name || loading"
              class="btn-primary"
            >
              <div v-if="loading" class="loading-spinner mr-2"></div>
              Crear Grupo
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useLeadGroups } from '~/composables/useLeadGroups'
import { useToast } from '~/composables/useToast'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'created'])

const { createLeadGroup, fetchLeadMetrics } = useLeadGroups()
const toast = useToast()

const loading = ref(false)
const previewData = ref(null)
const availableCampaigns = ref([])

const formData = reactive({
  group_name: '',
  group_description: '',
  filters: {
    min_interactions: 0,
    min_opens: 0,
    min_clicks: 0,
    source: '',
    medium: '',
    campaign: '',
    is_verified: false,
    is_converted: false
  }
})

const previewGroup = async () => {
  loading.value = true
  try {
    const response = await fetchLeadMetrics(formData.filters)
    previewData.value = {
      estimated_count: response.data?.total_filtered || 0
    }
  } catch (error) {
    toast.error('Error al obtener vista previa')
  } finally {
    loading.value = false
  }
}

const loadCampaigns = async () => {
  try {
    const response = await $fetch('/api/campaign')
    availableCampaigns.value = response.data || []
  } catch (error) {
    console.error('Error loading campaigns:', error)
  }
}

const createGroup = async () => {
  if (!formData.group_name) {
    toast.error('El nombre del grupo es requerido')
    return
  }

  loading.value = true
  try {
    // Limpiar filtros vacíos antes de enviar
    const cleanedFormData = {
      group_name: formData.group_name,
      group_description: formData.group_description,
      filters: {}
    }

    // Solo agregar filtros que tienen valores
    if (formData.filters.min_interactions > 0) cleanedFormData.filters.min_interactions = formData.filters.min_interactions
    if (formData.filters.min_opens > 0) cleanedFormData.filters.min_opens = formData.filters.min_opens
    if (formData.filters.min_clicks > 0) cleanedFormData.filters.min_clicks = formData.filters.min_clicks
    if (formData.filters.source) cleanedFormData.filters.source = formData.filters.source
    if (formData.filters.medium) cleanedFormData.filters.medium = formData.filters.medium
    if (formData.filters.campaign) cleanedFormData.filters.campaign = formData.filters.campaign
    
    // Solo enviar checkboxes si están marcados
    if (formData.filters.is_verified) cleanedFormData.filters.is_verified = true
    if (formData.filters.is_converted) cleanedFormData.filters.is_converted = true

    await createLeadGroup(cleanedFormData)
    toast.success('Grupo creado exitosamente')
    emit('created')
    emit('close')
  } catch (error) {
    toast.error('Error al crear el grupo')
  } finally {
    loading.value = false
  }
}

// Cargar campañas cuando se abra el modal
watch(() => props.show, (newValue) => {
  if (newValue) {
    loadCampaigns()
  }
})
</script>