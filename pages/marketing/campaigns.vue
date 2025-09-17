<template>
  <div class="dashboard-page">
    <!-- Loading State -->
    <div v-if="loading">
      <CommonsTheLoading />
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Campaigns List View -->
      <div v-if="!showEditForm && !showCreateForm">
        <div class="page-header">
          <div>
            <h2 class="page-title">Campañas de Marketing</h2>
            <p class="page-description">Gestiona tus campañas de email marketing</p>
          </div>
          <div class="flex gap-2">
            <UiButton @click="toggleCreateForm" :variant="showCreateForm ? 'outline' : 'default'" class="flex items-center gap-2">
              <PlusIcon v-if="!showCreateForm" class="w-4 h-4" />
              <XMarkIcon v-else class="w-4 h-4" />
              {{ showCreateForm ? 'Cancelar' : 'Nueva Campaña' }}
            </UiButton>
          </div>
        </div>

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 section-spacing">
          <StatCard 
            :value="campaigns.length" 
            label="total campañas" 
            icon="heroicons:megaphone" 
          />
          <StatCard 
            :value="activeCampaigns" 
            label="campañas activas" 
            icon="heroicons:play" 
          />
          <StatCard 
            :value="draftCampaigns" 
            label="borradores" 
            icon="heroicons:document" 
          />
          <StatCard 
            :value="completedCampaigns" 
            label="completadas" 
            icon="heroicons:check-circle" 
          />
        </div>

        <div class="section-spacing">
          <CampaignsTable 
            :campaigns="campaigns" 
            :deleting-campaign="deletingCampaignId"
            @create="toggleCreateForm"
            @edit="editCampaign"
            @view="viewCampaign"
            @delete="deleteCampaign"
          />
        </div>
      </div>

      <!-- Empty State -->
      <Transition
        v-if="shouldShowEmptyState"
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 transform scale-95"
        enter-to-class="opacity-100 transform scale-100"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 transform scale-100"
        leave-to-class="opacity-0 transform scale-95"
      >
        <div class="text-center py-12">
          <MegaphoneIcon class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 class="text-lg font-medium text-muted-foreground">No hay campañas creadas</h3>
          <p class="text-muted-foreground mb-4">Crea tu primera campaña para comenzar con el marketing</p>
          <UiButton @click="toggleCreateForm">
            Crear Primera Campaña
          </UiButton>
        </div>
      </Transition>

      <!-- Create/Edit Form -->
      <Transition
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 transform -translate-y-5"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-5"
      >
        <UiCard v-if="showCreateForm || showEditForm">
          <UiCardHeader>
            <div class="flex items-center gap-3">
              <UiButton variant="ghost" size="sm" @click="cancelForm" class="p-2">
                <ArrowLeftIcon class="w-4 h-4" />
              </UiButton>
              <UiCardTitle class="font-principal text-lg">{{ showEditForm ? 'Editar Campaña' : 'Nueva Campaña' }}</UiCardTitle>
            </div>
          </UiCardHeader>
          <UiCardContent class="space-y-4">
            <div class="space-y-6">
              <!-- Campaign Basic Info -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">Nombre de la Campaña</label>
                    <UiInput v-model="campaignForm.name" placeholder="Ej: Newsletter Enero 2024" class="h-10 w-full" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">Slug (URL)</label>
                    <UiInput v-model="campaignForm.slug" placeholder="newsletter-enero-2024" class="h-10 w-full" />
                    <p class="text-xs text-muted-foreground mt-1">Se usará en la URL de la landing page</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">Website</label>
                    <UiInput v-model="campaignForm.website" placeholder="https://ejemplo.com" type="url" class="h-10 w-full" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">Estado</label>
                    <select 
                      v-model="campaignForm.status" 
                      class="w-full h-10 p-2 border border-border bg-background"
                    >
                      <option value="draft">Borrador</option>
                      <option value="active">Activa</option>
                      <option value="paused">Pausada</option>
                      <option value="completed">Completada</option>
                    </select>
                  </div>
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">Descripción</label>
                    <textarea 
                      v-model="campaignForm.description" 
                      class="w-full p-3 border border-border bg-background resize-none"
                      rows="4"
                      placeholder="Describe el propósito de esta campaña..."
                    ></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">Tags</label>
                    <UiInput v-model="campaignForm.tags" placeholder="marketing, newsletter, promoción" class="h-10 w-full" />
                    <p class="text-xs text-muted-foreground mt-1">Separa los tags con comas</p>
                  </div>
                </div>
              </div>

              <!-- Template Pairs Selection -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-medium">Templates de Campaña</h3>
                    <p class="text-sm text-muted-foreground">Selecciona un par de templates (Email + Landing) para esta campaña</p>
                  </div>
                  <NuxtLink to="/marketing/templates" class="text-sm text-primary hover:underline">
                    Crear nuevos templates →
                  </NuxtLink>
                </div>

                <div v-if="loadingTemplatePairs" class="flex items-center justify-center py-8">
                  <div class="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span class="ml-2 text-sm text-muted-foreground">Cargando pares de templates...</span>
                </div>

                <div v-else-if="templatePairs.length === 0" class="text-center py-8 border-2 border-dashed border-border">
                  <DocumentDuplicateIcon class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h4 class="text-lg font-medium text-muted-foreground mb-2">No hay pares de templates</h4>
                  <p class="text-sm text-muted-foreground mb-4">Necesitas crear pares de templates (Email + Landing) para usar en las campañas</p>
                  <NuxtLink to="/marketing/templates" class="btn-primary">
                    Crear Templates
                  </NuxtLink>
                </div>

                <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div 
                    v-for="pair in templatePairs" 
                    :key="pair.pair_id"
                    @click="selectTemplatePair(pair)"
                    :class="[
                      'cursor-pointer border-2 p-4 transition-all duration-200',
                      campaignForm.selectedPairId === pair.pair_id 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-border hover:border-primary/50 hover:shadow-sm'
                    ]"
                  >
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex-1">
                        <h4 class="font-medium">{{ pair.name }}</h4>
                        <p class="text-sm text-muted-foreground">{{ pair.description }}</p>
                      </div>
                      <div v-if="campaignForm.selectedPairId === pair.pair_id" class="text-primary">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                      <div class="space-y-2">
                        <div class="flex items-center gap-2">
                          <div class="w-2 h-2 rounded-full bg-green-500"></div>
                          <span class="text-sm font-medium">Template Email</span>
                        </div>
                        <p class="text-xs text-muted-foreground">{{ pair.email_template?.name || 'Template de Email' }}</p>
                      </div>
                      
                      <div class="space-y-2">
                        <div class="flex items-center gap-2">
                          <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span class="text-sm font-medium">Template Landing</span>
                        </div>
                        <p class="text-xs text-muted-foreground">{{ pair.landing_template?.name || 'Template de Landing' }}</p>
                      </div>
                    </div>

                    <div class="mt-3 pt-3 border-t border-border/50">
                      <div class="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Remitente: {{ pair.sender_email }}</span>
                        <span>{{ new Date(pair.created_at).toLocaleDateString() }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <UiButton variant="outline" @click="cancelForm">
                Cancelar
              </UiButton>
              <CommonsLoadingButton 
                :text="showEditForm ? 'Guardar Cambios' : 'Crear Campaña'"
                :loading-text="showEditForm ? 'Guardando...' : 'Creando...'"
                :loading="savingCampaign"
                :disabled="!campaignForm.name || !campaignForm.slug || (!showEditForm && !campaignForm.selectedPairId)"
                @click="saveCampaign"
                class="btn-primary"
              />
            </div>
          </UiCardContent>
        </UiCard>
      </Transition>
    </div>

    <!-- Delete Confirmation Modal -->
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
                  <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <UiCardTitle class="text-destructive">Eliminar Campaña</UiCardTitle>
                  <p class="text-sm text-muted-foreground mt-1">Esta acción no se puede deshacer</p>
                </div>
              </div>
            </UiCardHeader>

            <UiCardContent>
              <div class="space-y-4">
                <div v-if="campaignToDelete" class="p-4 bg-muted/30">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium">{{ campaignToDelete.name }}</p>
                      <p class="text-sm text-muted-foreground">{{ campaignToDelete.total_leads || 0 }} leads asociados</p>
                    </div>
                    <div class="text-right">
                      <p class="text-xs text-muted-foreground">Estado</p>
                      <p class="text-sm font-medium">{{ getCampaignStatusLabel(campaignToDelete.status) }}</p>
                    </div>
                  </div>
                </div>
                
                <p class="text-sm text-muted-foreground">
                  ¿Estás seguro de que quieres eliminar esta campaña? 
                  Se perderán todos los datos asociados incluyendo templates y métricas.
                </p>
              </div>
            </UiCardContent>

            <UiCardFooter class="flex gap-2 justify-end">
              <UiButton variant="outline" @click="cancelDelete" :disabled="isDeletingCampaign">
                Cancelar
              </UiButton>
              <UiButton variant="destructive" @click="confirmDeleteCampaign" :disabled="isDeletingCampaign">
                <div v-if="isDeletingCampaign" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                {{ isDeletingCampaign ? 'Eliminando...' : 'Eliminar Campaña' }}
              </UiButton>
            </UiCardFooter>
          </UiCard>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCampaigns } from '~/composables/useCampaigns'
import { useToast } from '@/composables/useToast'
import { 
  PlusIcon, 
  XMarkIcon, 
  ArrowLeftIcon,
  MegaphoneIcon,
  DocumentDuplicateIcon
} from '@heroicons/vue/24/outline'
import CampaignsTable from '@/components/CampaignsTable.vue'
import StatCard from '@/components/Commons/StatCard.vue'

const { 
  loading, 
  campaigns, 
  fetchCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign: deleteCampaignAPI
} = useCampaigns()

const toast = useToast()

const showCreateForm = ref(false)
const showEditForm = ref(false)
const savingCampaign = ref(false)
const showDeleteModal = ref(false)
const campaignToDelete = ref(null)
const isDeletingCampaign = ref(false)
const deletingCampaignId = ref(null)

// Template pairs state
const templatePairs = ref([])
const loadingTemplatePairs = ref(false)

const campaignForm = ref({
  id: null,
  name: '',
  description: '',
  slug: '',
  website: '',
  status: 'draft',
  tags: '',
  selectedPairId: null
})

// Computed properties
const shouldShowEmptyState = computed(() => {
  return campaigns.value.length === 0 && 
         !showCreateForm.value && 
         !showEditForm.value && 
         !loading.value && 
         !savingCampaign.value
})

const activeCampaigns = computed(() => {
  return campaigns.value.filter(campaign => campaign.status === 'active').length
})

const draftCampaigns = computed(() => {
  return campaigns.value.filter(campaign => campaign.status === 'draft').length
})

const completedCampaigns = computed(() => {
  return campaigns.value.filter(campaign => campaign.status === 'completed').length
})

// Template pairs methods
const loadTemplatePairs = async () => {
  try {
    loadingTemplatePairs.value = true
    const response = await $fetch('/api/templates/pairs')
    templatePairs.value = response.data || []
  } catch (error) {
    console.error('Error loading template pairs:', error)
    templatePairs.value = []
    toast.error('Error al cargar los pares de templates')
  } finally {
    loadingTemplatePairs.value = false
  }
}

const selectTemplatePair = (pair) => {
  campaignForm.value.selectedPairId = pair.pair_id
}

// Methods
const toggleCreateForm = () => {
  showCreateForm.value = !showCreateForm.value
  if (showCreateForm.value) {
    showEditForm.value = false
    resetForm()
    loadTemplatePairs()
  }
}

const editCampaign = async (campaign) => {
  campaignForm.value = {
    id: campaign.id,
    name: campaign.name,
    description: campaign.description || '',
    slug: campaign.slug,
    website: campaign.website || '',
    status: campaign.status,
    tags: campaign.tags || '',
    selectedPairId: campaign.pair_id || null
  }
  
  showCreateForm.value = false
  showEditForm.value = true
  await loadTemplatePairs()
}

const saveCampaign = async () => {
  if (!campaignForm.value.name || !campaignForm.value.slug) {
    toast.error('Nombre y slug son campos obligatorios')
    return
  }

  if (!showEditForm.value && !campaignForm.value.selectedPairId) {
    toast.error('Debes seleccionar un par de templates para la campaña')
    return
  }

  try {
    savingCampaign.value = true
    
    const payload = {
      name: campaignForm.value.name,
      description: campaignForm.value.description,
      slug: campaignForm.value.slug,
      website: campaignForm.value.website,
      status: campaignForm.value.status,
      tags: campaignForm.value.tags,
      pair_id: campaignForm.value.selectedPairId
    }

    if (showEditForm.value) {
      await updateCampaign(campaignForm.value.id, payload)
      toast.success('Campaña actualizada exitosamente')
    } else {
      await createCampaign(payload)
      toast.success('Campaña creada exitosamente')
    }
    
    showCreateForm.value = false
    showEditForm.value = false
    
    setTimeout(async () => {
      await fetchCampaigns()
      resetForm()
    }, 300)
  } catch (error) {
    console.error('Error guardando la campaña:', error)
    toast.error('Error al guardar la campaña.')
  } finally {
    savingCampaign.value = false
  }
}

const viewCampaign = (campaign) => {
  // Open campaign landing page in new tab
  const url = `${campaign.website}/landing/${campaign.slug}`
  window.open(url, '_blank')
}

const deleteCampaign = (campaign) => {
  campaignToDelete.value = campaign
  showDeleteModal.value = true
}

const confirmDeleteCampaign = async () => {
  if (!campaignToDelete.value) return
  
  isDeletingCampaign.value = true
  deletingCampaignId.value = campaignToDelete.value.id
  
  try {
    await deleteCampaignAPI(campaignToDelete.value.id)
    toast.success(`Campaña "${campaignToDelete.value.name}" eliminada exitosamente`)
    await fetchCampaigns()
    showDeleteModal.value = false
    campaignToDelete.value = null
  } catch (error) {
    console.error('Error al eliminar campaña:', error)
    toast.error('Error al eliminar la campaña. Inténtalo de nuevo.')
  } finally {
    isDeletingCampaign.value = false
    deletingCampaignId.value = null
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  campaignToDelete.value = null
}

const cancelForm = () => {
  showCreateForm.value = false
  showEditForm.value = false
  setTimeout(() => {
    resetForm()
  }, 300)
}

const resetForm = () => {
  campaignForm.value = {
    id: null,
    name: '',
    description: '',
    slug: '',
    website: '',
    status: 'draft',
    tags: '',
    selectedPairId: null
  }
}

const getCampaignStatusLabel = (status) => {
  const labels = {
    draft: 'Borrador',
    active: 'Activa',
    paused: 'Pausada',
    completed: 'Completada'
  }
  return labels[status] || status
}

// Load data on mount
onMounted(() => {
  fetchCampaigns()
})
</script>