<template>
  <div class="dashboard-page">
    <!-- Loading State -->
    <div v-if="loading">
      <CommonsTheLoading />
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Header (always visible) -->
      <div v-if="!showCreateForm" class="page-header">
        <div>
          <h2 class="page-title">Grupos de Leads</h2>
          <p class="page-description">Segmenta y gestiona tus leads basándote en métricas de engagement</p>
        </div>
        <div class="flex gap-2">
          <NuxtLink
            to="/marketing/analytics"
            class="btn-secondary"
          >
            <ChartBarIcon class="w-5 h-5" />
            Ver Métricas
          </NuxtLink>
          <UiButton @click="toggleCreateForm" class="flex items-center gap-2">
            <PlusIcon class="w-4 h-4" />
            Crear Grupo
          </UiButton>
        </div>
      </div>

      <!-- List View -->
      <div v-if="!showCreateForm">

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 section-spacing">
          <StatCard 
            :value="leadGroups.length" 
            label="total grupos" 
            icon="heroicons:user-group" 
          />
          <StatCard 
            :value="totalLeads" 
            label="total leads" 
            icon="heroicons:users" 
          />
          <StatCard 
            :value="`${avgConversionRate}%`" 
            label="tasa conversión promedio" 
            icon="heroicons:chart-bar" 
          />
          <StatCard 
            :value="highlyEngagedCount" 
            label="engagement alto" 
            icon="heroicons:bolt" 
          />
        </div>

        <!-- Lead Groups List -->
        <div class="section-spacing">
          <LeadGroupsTable 
            :lead-groups="leadGroups" 
            :loading="loading"
            @create="toggleCreateForm"
            @delete="confirmDeleteGroup"
          />
        </div>
      </div>

      <!-- Create Group Form (Inline) -->
      <Transition
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 transform -translate-y-5"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-5"
      >
        <UiCard v-if="showCreateForm" class="border-2 border-primary/20">
          <UiCardHeader>
            <div class="flex items-center gap-3">
              <UiButton variant="ghost" size="sm" @click="cancelForm" class="p-2">
                <ArrowLeftIcon class="w-4 h-4" />
              </UiButton>
              <div>
                <UiCardTitle>
                  Crear Grupo de Leads
                </UiCardTitle>
                <p class="text-sm text-muted-foreground">Segmenta tus leads basándote en métricas de engagement</p>
              </div>
            </div>
          </UiCardHeader>
          <UiCardContent>
            <div class="space-y-6">
                <!-- Basic Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30">
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium mb-2">
                      Nombre del Grupo *
                    </label>
                    <UiInput
                      v-model="formData.group_name"
                      placeholder="Ej: Leads Altamente Comprometidos"
                      class="h-10 w-full"
                    ></UiInput>
                  </div>
                  
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium mb-2">
                      Descripción
                    </label>
                    <UiTextarea
                      v-model="formData.group_description"
                      placeholder="Describe el propósito de este grupo..."
                      class="w-full resize-none"
                      rows="2"
                    ></UiTextarea>
                  </div>
                </div>

                <!-- Filters -->
                <div>
                  <h3 class="text-lg font-semibold mb-4">Criterios de Segmentación</h3>
                  
                  <!-- Source Selection -->
                  <div class="bg-primary/5 border border-primary/20 p-4 mb-4">
                    <h4 class="font-medium mb-3">Origen de Leads</h4>
                    <div class="space-y-3">
                      <label class="flex items-center">
                        <input
                          v-model="formData.source_type"
                          value="all"
                          type="radio"
                          class="mr-2"
                        />
                        <span class="text-sm">Todos los leads (filtrar por criterios)</span>
                      </label>
                      
                      <label class="flex items-center">
                        <input
                          v-model="formData.source_type"
                          value="existing_group"
                          type="radio"
                          class="mr-2"
                        />
                        <span class="text-sm">Seleccionar de un grupo existente</span>
                      </label>
                    </div>
                    
                    <!-- Existing Group Selection -->
                    <div v-if="formData.source_type === 'existing_group'" class="mt-3">
                      <label class="block text-sm font-medium mb-1">
                        Grupo de Origen
                      </label>
                      <select
                        v-model="formData.source_group_id"
                        class="w-full h-10 p-2 border border-border bg-background"
                      >
                        <option value="">Selecciona un grupo</option>
                        <option v-for="group in leadGroups" :key="group.id" :value="group.id">
                          {{ group.name }} ({{ group.member_count || 0 }} leads)
                        </option>
                      </select>
                    </div>
                  </div>
                  
                  <!-- Engagement Metrics (solo para 'all') -->
                  <div v-if="formData.source_type === 'all'" class="bg-muted/50 p-4 mb-4">
                    <h4 class="font-medium mb-3">Métricas de Engagement</h4>
                    <div class="grid grid-cols-3 gap-4">
                      <div>
                        <label class="block text-sm font-medium mb-1">
                          Interacciones Mínimas
                        </label>
                        <UiInput
                          v-model.number="formData.filters.min_interactions"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="h-10 w-full"
                        ></UiInput>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium mb-1">
                          Aperturas Mínimas
                        </label>
                        <UiInput
                          v-model.number="formData.filters.min_opens"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="h-10 w-full"
                        ></UiInput>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium mb-1">
                          Clicks Mínimos
                        </label>
                        <UiInput
                          v-model.number="formData.filters.min_clicks"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="h-10 w-full"
                        ></UiInput>
                      </div>
                    </div>
                  </div>

                  <!-- Interaction Type Filters (solo para 'all') -->
                  <div v-if="formData.source_type === 'all'" class="bg-muted/50 p-4 mb-4">
                    <h4 class="font-medium mb-3">Tipos de Interacción</h4>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium mb-1">
                          Debe Tener Interacción
                        </label>
                        <select
                          v-model="formData.filters.has_interaction_type"
                          class="w-full h-10 p-2 border border-border bg-background"
                        >
                          <option value="">Cualquiera</option>
                          <option v-for="type in availableInteractionTypes" :key="type.value" :value="type.value">
                            {{ type.label }}
                          </option>
                        </select>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium mb-1">
                          No Debe Tener Interacción
                        </label>
                        <select
                          v-model="formData.filters.exclude_interaction_type"
                          class="w-full h-10 p-2 border border-border bg-background"
                        >
                          <option value="">Ninguna Exclusión</option>
                          <option v-for="type in availableInteractionTypes" :key="type.value" :value="type.value">
                            {{ type.label }}
                          </option>
                        </select>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium mb-1">
                          Solo Esta Interacción
                        </label>
                        <select
                          v-model="formData.filters.only_interaction_type"
                          class="w-full h-10 p-2 border border-border bg-background"
                        >
                          <option value="">No Aplicar</option>
                          <option v-for="type in availableInteractionTypes" :key="type.value" :value="type.value">
                            Solo {{ type.label }}
                          </option>
                        </select>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium mb-1">
                          Actividad Reciente (Días)
                        </label>
                        <select
                          v-model.number="formData.filters.recent_interaction_days"
                          class="w-full h-10 p-2 border border-border bg-background"
                        >
                          <option :value="undefined">Sin Filtro</option>
                          <option :value="1">Último día</option>
                          <option :value="3">Últimos 3 días</option>
                          <option :value="7">Última semana</option>
                          <option :value="14">Últimas 2 semanas</option>
                          <option :value="30">Último mes</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Advanced Filters (solo para 'all') -->
                  <div v-if="formData.source_type === 'all'" class="bg-muted/50 p-4 mb-4">
                    <h4 class="font-medium mb-3">Filtros Avanzados</h4>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium mb-1">
                          Interacciones Totales (Mín)
                        </label>
                        <UiInput
                          v-model.number="formData.filters.min_total_interactions"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="h-10 w-full"
                        ></UiInput>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium mb-1">
                          Interacciones Totales (Máx)
                        </label>
                        <UiInput
                          v-model.number="formData.filters.max_total_interactions"
                          type="number"
                          min="0"
                          placeholder="Sin límite"
                          class="h-10 w-full"
                        ></UiInput>
                      </div>
                    </div>
                  </div>

                  <!-- Source Filters (solo para 'all') -->
                  <div v-if="formData.source_type === 'all'" class="bg-muted/50 p-4 mb-4">
                    <h4 class="font-medium mb-3">Origen del Tráfico</h4>
                    <div class="grid grid-cols-3 gap-4">
                      <div>
                        <label class="block text-sm font-medium mb-1">
                          Fuente (Source)
                        </label>
                        <select
                          v-model="formData.filters.source"
                          class="w-full h-10 p-2 border border-border bg-background"
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
                          class="w-full h-10 p-2 border border-border bg-background"
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
                          Campañas
                        </label>
                        <div class="border border-border bg-background p-3 max-h-40 overflow-y-auto">
                          <div class="space-y-2">
                            <label class="flex items-center">
                              <input
                                type="checkbox"
                                :checked="formData.filters.campaigns.length === 0"
                                @change="toggleAllCampaigns"
                                class="mr-2"
                              />
                              <span class="text-sm font-medium">Todas las campañas</span>
                            </label>
                            
                            <div class="border-t pt-2">
                              <label 
                                v-for="campaign in availableCampaigns" 
                                :key="campaign.id" 
                                class="flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  :value="campaign.slug"
                                  :checked="formData.filters.campaigns.includes(campaign.slug)"
                                  @change="toggleCampaign(campaign.slug)"
                                  class="mr-2"
                                />
                                <span class="text-sm">{{ campaign.name }}</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Lead Status (solo para 'all') -->
                  <div v-if="formData.source_type === 'all'" class="bg-muted/50 p-4">
                    <h4 class="font-medium mb-3">Estado del Lead</h4>
                    <div class="flex gap-6">
                      <label class="flex items-center">
                        <input
                          v-model="formData.filters.is_verified"
                          type="checkbox"
                          class="mr-2 text-primary"
                        />
                        <span class="text-sm">Solo verificados</span>
                      </label>
                      
                      <label class="flex items-center">
                        <input
                          v-model="formData.filters.is_converted"
                          type="checkbox"
                          class="mr-2 text-primary"
                        />
                        <span class="text-sm">Solo convertidos</span>
                      </label>
                    </div>
                  </div>
                </div>

            </div>
            
            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-6 border-t">
              <UiButton variant="outline" @click="cancelForm">
                Cancelar
              </UiButton>
              <UiButton 
                @click="createGroup"
                :disabled="!formData.group_name || isCreating"
                class="bg-primary text-primary-foreground"
              >
                <div v-if="isCreating" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Crear Grupo
              </UiButton>
            </div>
          </UiCardContent>
        </UiCard>
      </Transition>


    </div>

  <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <Transition
          enter-active-class="transition-all duration-300 ease-out delay-100"
          enter-from-class="opacity-0 transform scale-95 -translate-y-4"
          enter-to-class="opacity-100 transform scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 transform scale-100 translate-y-0"
          leave-to-class="opacity-0 transform scale-95 -translate-y-4"
        >
          <UiCard v-if="showDeleteModal" class="w-full max-w-md border-2 border-destructive/20">
            <UiCardHeader>
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-full bg-destructive/10">
                  <ExclamationTriangleIcon class="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <UiCardTitle class="text-destructive">Eliminar Grupo</UiCardTitle>
                  <p class="text-sm text-muted-foreground mt-1">Esta acción no se puede deshacer</p>
                </div>
              </div>
            </UiCardHeader>

            <UiCardContent>
              <div class="space-y-4">
                <div v-if="groupToDelete" class="p-4 bg-muted/30">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium">{{ groupToDelete.name }}</p>
                      <p class="text-sm text-muted-foreground">{{ groupToDelete.member_count || 0 }} miembros</p>
                    </div>
                    <div class="text-right">
                      <p class="text-xs text-muted-foreground">Creado</p>
                      <p class="text-sm font-medium">{{ new Date(groupToDelete.created_at).toLocaleDateString() }}</p>
                    </div>
                  </div>
                </div>
                
                <p class="text-sm text-muted-foreground">
                  ¿Estás seguro de que quieres eliminar este grupo de leads? 
                  Se perderán todos los datos de segmentación asociados.
                </p>
              </div>
            </UiCardContent>

            <UiCardFooter class="flex gap-2 justify-end">
              <UiButton variant="outline" @click="cancelDelete" :disabled="isDeleting">
                Cancelar
              </UiButton>
              <UiButton variant="destructive" @click="deleteLeadGroup" :disabled="isDeleting">
                <div v-if="isDeleting" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                {{ isDeleting ? 'Eliminando...' : 'Eliminar Grupo' }}
              </UiButton>
            </UiCardFooter>
          </UiCard>
        </Transition>
      </div>
    </Transition> 
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { 
  ChartBarIcon, 
  PlusIcon, 
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import { useLeadGroups } from '~/composables/useLeadGroups'
import { useToast } from '@/composables/useToast'
import LeadGroupsTable from '@/components/LeadGroupsTable.vue'
import StatCard from '@/components/Commons/StatCard.vue'

const { 
  loading, 
  leadGroups, 
  fetchLeadGroups,
  fetchLeadMetrics,
  createLeadGroup,
  getAvailableInteractionTypes
} = useLeadGroups()

const toast = useToast()

const showCreateForm = ref(false)
const showDeleteModal = ref(false)
const groupToDelete = ref(null)
const isDeleting = ref(false)
const isCreating = ref(false)
const availableCampaigns = ref([])
const availableInteractionTypes = ref(getAvailableInteractionTypes())

const formData = reactive({
  group_name: '',
  group_description: '',
  source_type: 'all', // 'all' or 'existing_group'
  source_group_id: '',
  filters: {
    min_interactions: 0,
    min_opens: 0,
    min_clicks: 0,
    source: '',
    medium: '',
    campaigns: [],
    is_verified: false,
    is_converted: false,
    has_interaction_type: '',
    exclude_interaction_type: '',
    only_interaction_type: '',
    recent_interaction_days: undefined,
    min_total_interactions: undefined,
    max_total_interactions: undefined
  }
})

// Computed properties
const totalLeads = computed(() => {
  return leadGroups.value.reduce((sum, group) => sum + (group.member_count || 0), 0)
})

const avgConversionRate = computed(() => {
  if (leadGroups.value.length === 0) return 0
  const sum = leadGroups.value.reduce((acc, group) => acc + (group.conversion_rate || 0), 0)
  return Math.round(sum / leadGroups.value.length)
})

const highlyEngagedCount = computed(() => {
  return leadGroups.value.reduce((sum, group) => {
    return sum + (group.recent_activity?.recent_clicks || 0)
  }, 0)
})

// Methods
const onGroupCreated = async () => {
  await fetchLeadGroups()
}





// Form management functions
const toggleCreateForm = () => {
  showCreateForm.value = !showCreateForm.value
  if (showCreateForm.value) {
    resetForm()
    loadCampaigns()
  }
}

const cancelForm = () => {
  showCreateForm.value = false
  setTimeout(() => {
    resetForm()
  }, 300)
}

const resetForm = () => {
  formData.group_name = ''
  formData.group_description = ''
  formData.source_type = 'all'
  formData.source_group_id = ''
  formData.filters = {
    min_interactions: 0,
    min_opens: 0,
    min_clicks: 0,
    source: '',
    medium: '',
    campaigns: [],
    is_verified: false,
    is_converted: false,
    has_interaction_type: '',
    exclude_interaction_type: '',
    only_interaction_type: '',
    recent_interaction_days: undefined,
    min_total_interactions: undefined,
    max_total_interactions: undefined
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

const toggleAllCampaigns = () => {
  if (formData.filters.campaigns.length === 0) {
    // Currently showing "all campaigns", so we don't change anything
    // Keep it empty to mean "all campaigns"
    formData.filters.campaigns = []
  } else {
    // Currently has specific campaigns selected, so clear to show "all campaigns"
    formData.filters.campaigns = []
  }
}

const toggleCampaign = (campaignSlug) => {
  const index = formData.filters.campaigns.indexOf(campaignSlug)
  if (index > -1) {
    // Remove campaign from selection
    formData.filters.campaigns.splice(index, 1)
    // If no campaigns are selected, it means "all campaigns" 
    // The checkbox will auto-update via reactive :checked
  } else {
    // Add campaign to selection
    formData.filters.campaigns.push(campaignSlug)
    // Now we have specific campaigns selected, so "all campaigns" will be unchecked
  }
}


const createGroup = async () => {
  if (!formData.group_name) {
    toast.error('El nombre del grupo es requerido')
    return
  }

  // Validar selección de grupo origen si es necesario
  if (formData.source_type === 'existing_group' && !formData.source_group_id) {
    toast.error('Selecciona un grupo de origen')
    return
  }

  isCreating.value = true
  try {
    // Limpiar filtros vacíos antes de enviar
    const cleanedFormData = {
      group_name: formData.group_name,
      group_description: formData.group_description,
      source_type: formData.source_type,
      source_group_id: formData.source_group_id,
      filters: {}
    }

    // Solo agregar filtros que tienen valores (solo se aplican si source_type === 'all')
    if (formData.source_type === 'all') {
      if (formData.filters.min_interactions > 0) cleanedFormData.filters.min_interactions = formData.filters.min_interactions
      if (formData.filters.min_opens > 0) cleanedFormData.filters.min_opens = formData.filters.min_opens
      if (formData.filters.min_clicks > 0) cleanedFormData.filters.min_clicks = formData.filters.min_clicks
      if (formData.filters.source) cleanedFormData.filters.source = formData.filters.source
      if (formData.filters.medium) cleanedFormData.filters.medium = formData.filters.medium
      if (formData.filters.campaigns && formData.filters.campaigns.length > 0) cleanedFormData.filters.campaigns = formData.filters.campaigns
      
      // Solo enviar checkboxes si están marcados
      if (formData.filters.is_verified) cleanedFormData.filters.is_verified = true
      if (formData.filters.is_converted) cleanedFormData.filters.is_converted = true
    }

    await createLeadGroup(cleanedFormData)
    toast.success('Grupo creado exitosamente')
    await fetchLeadGroups()
    showCreateForm.value = false
    resetForm()
  } catch (error) {
    toast.error('Error al crear el grupo')
  } finally {
    isCreating.value = false
  }
}

const confirmDeleteGroup = (group) => {
  groupToDelete.value = group
  showDeleteModal.value = true
}

const deleteLeadGroup = async () => {
  if (!groupToDelete.value) return
  
  isDeleting.value = true
  
  try {
    const response = await $fetch(`/api/lead-groups/${groupToDelete.value.id}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      toast.success(`Grupo "${groupToDelete.value.name}" eliminado exitosamente`)
      await fetchLeadGroups() // Recargar la lista
      showDeleteModal.value = false
      groupToDelete.value = null
    }
  } catch (error) {
    console.error('Error al eliminar grupo:', error)
    toast.error('Error al eliminar el grupo. Inténtalo de nuevo.')
  } finally {
    isDeleting.value = false
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  groupToDelete.value = null
}

// Load data on mount

onMounted(() => {
  fetchLeadGroups()
})
</script>