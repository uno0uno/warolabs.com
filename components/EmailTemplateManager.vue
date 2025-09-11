<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold font-principal">Templates de Email</h2>
        <p class="text-sm text-muted-foreground">Gestiona templates para todos los tipos de email</p>
      </div>
      <UiButton @click="toggleCreateForm" :variant="showCreateForm ? 'outline' : 'default'" class="flex items-center gap-2">
        <svg v-if="!showCreateForm" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        {{ showCreateForm ? 'Cancelar' : 'Nuevo Template' }}
      </UiButton>
    </div>

    <Transition
      enter-active-class="transition-all duration-400 ease-out"
      enter-from-class="opacity-0 transform translate-y-[-20px]"
      enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 transform translate-y-0"
      leave-to-class="opacity-0 transform translate-y-[-20px]"
    >
      <UiCard v-if="showCreateForm || showEditModal">
        <UiCardHeader>
          <div class="flex items-center gap-3">
            <UiButton v-if="showEditModal" variant="ghost" size="sm" @click="cancelForm" class="p-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </UiButton>
            <UiCardTitle class="font-principal text-lg">{{ showEditModal ? 'Editar Template' : 'Nuevo Template' }}</UiCardTitle>
          </div>
        </UiCardHeader>
      <UiCardContent class="space-y-4">
        <div class="flex gap-6">
          <div class="flex flex-col gap-4 w-1/2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Nombre del Template</label>
                <UiInput v-model="templateForm.name" placeholder="Ej: Newsletter mensual" class="h-10 w-full" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Asunto por Defecto</label>
                <UiInput v-model="templateForm.subject" placeholder="Asunto del email..." class="h-10 w-full" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Email Remitente</label>
                <UiInput v-model="templateForm.senderEmail" placeholder="noreply@warolabs.com" type="email" class="h-10 w-full" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Tipo de Template</label>
                <select 
                  v-model="templateForm.templateType" 
                  class="w-full h-10 p-2 border border-border rounded-md bg-background"
                >
                  <option value="massive_email">Envío Masivo</option>
                  <option value="landing_confirmation">Confirmación Landing</option>
                  <option value="transactional_email">Transaccional</option>
                  <option value="notification_email">Notificación</option>
                  <option value="welcome_email">Bienvenida</option>
                  <option value="follow_up_email">Seguimiento</option>
                  <option value="newsletter_email">Newsletter</option>
                  <option value="promotional_email">Promocional</option>
                  <option value="event_email">Evento</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Campaña Asociada</label>
                <div 
                  v-if="selectedCampaignName" 
                  class="w-full p-3 h-10 border border-border rounded-md bg-muted text-muted-foreground flex items-center"
                >
                  {{ selectedCampaignName }} (Preseleccionada)
                </div>
                <select 
                  v-else
                  v-model="templateForm.campaignId" 
                  class="w-full h-10 p-2 border border-border rounded-md bg-background"
                >
                  <option value="">Selecciona una campaña...</option>
                  <option v-for="campaign in campaigns" :key="campaign.id" :value="campaign.id">
                    {{ campaign.name }}
                  </option>
                </select>
              </div>
              <div v-if="showEditModal && templateVersions.length > 0">
                <label class="block text-sm font-medium mb-2">Seleccionar Versión</label>
                <select 
                  v-model="selectedVersionId" 
                  @change="loadSelectedVersion"
                  class="w-full h-10 p-2 border border-border rounded-md bg-background"
                >
                  <option v-for="version in templateVersions" :key="version.id" :value="version.id">
                    Versión {{ version.version_number }} - {{ formatDate(version.created_at) }}
                    {{ version.id === templateForm.activeVersionId ? ' (Activa)' : '' }}
                  </option>
                </select>
              </div>
            </div>
            <div class="flex flex-col  h-full">
              <label class="block text-sm font-medium mb-2">Descripción</label>
              <textarea 
                v-model="templateForm.description" 
                class="w-full p-3 border border-border rounded-md bg-background h-full"
                rows="2"
                placeholder="Describe el propósito de este template..."
              ></textarea>
            </div>
          </div>  
          <div class="w-1/2">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium">Contenido del Email</label>
              <div v-if="showEditModal && templateForm.activeVersionId" class="flex items-center gap-1 text-sm text-muted-foreground">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h3a1 1 0 011 1v2h4a1 1 0 011 1v3a1 1 0 01-1 1h-4v4a1 1 0 01-1 1H8a1 1 0 01-1-1V9H3a1 1 0 01-1-1V5a1 1 0 011-1h4z"/>
                </svg>
                Editando versión {{ getActiveVersionNumber() }}
              </div>
            </div>
            <QuillEditorClient v-model="templateForm.content" />
            <p class="text-sm text-muted-foreground mt-2 flex flex-wrap gap-2">
              <span>Variables disponibles:</span>
              <code class="bg-muted px-1 rounded">&#123;&#123;nombre&#125;&#125;</code>
              <code class="bg-muted px-1 rounded">&#123;&#123;email&#125;&#125;</code>
              <code class="bg-muted px-1 rounded">&#123;&#123;empresa&#125;&#125;</code>
              <code class="bg-muted px-1 rounded">&#123;&#123;fecha&#125;&#125;</code>
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <UiButton variant="outline" @click="cancelForm">
            Cancelar
          </UiButton>
          <UiButton @click="saveTemplate" :disabled="!templateForm.name || !templateForm.content">
            {{ showEditModal ? 'Guardar Nueva Versión' : 'Crear Template' }}
          </UiButton>
        </div>
      </UiCardContent>
      </UiCard>
    </Transition>

    <!-- Loading overlay for template loading -->
    <Teleport to="body">
      <div v-if="loadingTemplate" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
        <CommonsTheLoading />
      </div>
    </Teleport>

    <div v-if="loading" class="flex items-center justify-center w-full h-full">
      <CommonsTheLoading />
    </div>

    <div v-else-if="templates.length === 0 && !showCreateForm && !showEditModal" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <h3 class="text-lg font-medium text-muted-foreground mb-2" style="font-family: 'Lato', sans-serif;">No hay templates de email</h3>
      <p class="text-muted-foreground mb-4">Crea tu primer template para comenzar con el envío de emails</p>
      <UiButton @click="toggleCreateForm">
        Crear Primer Template
      </UiButton>
    </div>

    <div v-else-if="!showEditModal" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <TemplateCard 
        v-for="template in templates" 
        :key="template.id" 
        :template="template"
        @click="editTemplate(template)"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCampaignStore } from '~/store/useCampaignStore'

const campaignStore = useCampaignStore()

const templates = ref([])
const campaigns = ref([])
const templateVersions = ref([])
const loading = ref(true)
const loadingTemplate = ref(false)

const showCreateForm = ref(false)
const showEditModal = ref(false)
const selectedVersionId = ref(null)

const templateForm = ref({
  id: null,
  name: '',
  description: '',
  subject: '',
  senderEmail: '',
  content: '',
  campaignId: campaignStore.selectedCampaignId || '',
  templateType: 'massive_email',
  activeVersionId: null
})

const selectedCampaignName = computed(() => {
  if (campaignStore.hasSelectedCampaign) {
    return campaignStore.getSelectedCampaign?.name || 'Campaña seleccionada'
  }
  return null
})

const loadTemplates = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/templates')
    templates.value = response.data || []
  } catch (error) {
    console.error('Error loading templates:', error)
    templates.value = []
  } finally {
    loading.value = false
  }
}

const loadCampaigns = async () => {
  try {
    const response = await $fetch('/api/campaign')
    campaigns.value = response.data || []
  } catch (error) {
    console.error('Error loading campaigns:', error)
    campaigns.value = [
      { id: '1', name: 'Asesoria Legal Gratis' },
      { id: '2', name: 'Curso n8n gratis online' },
      { id: '3', name: 'Guía Definitiva para transferir sus bienes' }
    ]
  }
}

const saveTemplate = async () => {
  try {
    const payload = {
      name: templateForm.value.name,
      description: templateForm.value.description,
      subject_template: templateForm.value.subject,
      sender_email: templateForm.value.senderEmail,
      content: templateForm.value.content,
      template_type: templateForm.value.templateType,
      campaign_id: templateForm.value.campaignId
    }

    console.log('🚀 Saving template payload:', payload)
    console.log('📝 Template form values:', templateForm.value)

    if (showEditModal.value) {
      console.log('✏️ Updating existing template:', templateForm.value.id)
      await $fetch(`/api/templates/${templateForm.value.id}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      console.log('➕ Creating new template')
      await $fetch('/api/templates', {
        method: 'POST',
        body: payload
      })
    }

    await loadTemplates()
    cancelForm()
  } catch (error) {
    console.error('❌ Error saving template:', error)
    console.error('📄 Error details:', error.data || error.message)
    alert('Error al guardar el template: ' + (error.data?.statusMessage || error.message))
  }
}

const loadTemplateVersions = async (templateId) => {
  try {
    const response = await $fetch(`/api/templates/${templateId}/versions`)
    templateVersions.value = response.data || []
  } catch (error) {
    console.error('Error loading template versions:', error)
    templateVersions.value = []
  }
}

const loadVersion = (version) => {
  templateForm.value.content = version.content
  templateForm.value.activeVersionId = version.id
}

const loadSelectedVersion = () => {
  const selectedVersion = templateVersions.value.find(v => v.id === selectedVersionId.value)
  if (selectedVersion) {
    templateForm.value.content = selectedVersion.content
    console.log('🔄 Loaded version:', selectedVersion.version_number, 'with content:', selectedVersion.content)
  }
}

const getActiveVersionNumber = () => {
  const activeVersion = templateVersions.value.find(v => v.id === templateForm.value.activeVersionId)
  return activeVersion?.version_number || 'N/A'
}

const editTemplate = async (template) => {
  try {
    loadingTemplate.value = true
    
    // Load version history first to get the most up-to-date data
    if (template.id) {
      await loadTemplateVersions(template.id)
    }
    
    // Find the active version from the loaded versions
    const activeVersion = templateVersions.value.find(v => v.is_active) || 
                         template.active_version || 
                         templateVersions.value[0] // fallback to latest version
    
    console.log('🔍 Debug editTemplate:', {
      template: template,
      templateVersions: templateVersions.value,
      activeVersion: activeVersion,
      content: activeVersion?.content || template.content || ''
    })
    
    templateForm.value = {
      id: template.id,
      name: template.name,
      description: template.description,
      subject: template.subject_template,
      senderEmail: template.sender_email,
      content: activeVersion?.content || template.content || '',
      campaignId: '',
      templateType: template.template_type || 'massive_email',
      activeVersionId: activeVersion?.id || null
    }
    
    // Set the selected version to the active version by default
    selectedVersionId.value = activeVersion?.id || null
    
    showCreateForm.value = false
    showEditModal.value = true
  } catch (error) {
    console.error('Error loading template:', error)
  } finally {
    loadingTemplate.value = false
  }
}


const toggleCreateForm = () => {
  showCreateForm.value = !showCreateForm.value
  if (showCreateForm.value) {
    resetForm()
  }
}

const cancelForm = () => {
  showCreateForm.value = false
  showEditModal.value = false
  resetForm()
}

const resetForm = () => {
  templateForm.value = {
    id: null,
    name: '',
    description: '',
    subject: '',
    senderEmail: '',
    content: '',
    campaignId: campaignStore.selectedCampaignId || '',
    templateType: 'massive_email',
    activeVersionId: null
  }
  templateVersions.value = []
  selectedVersionId.value = null
  loadingTemplate.value = false
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES')
}



onMounted(async () => {
  await Promise.all([
    loadTemplates(),
    loadCampaigns()
  ])
  
  campaignStore.setCampaigns(campaigns.value)
  
  loading.value = false
})
</script>