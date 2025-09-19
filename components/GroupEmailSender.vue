<template>
  <div v-if="loading" class="space-y-6">
    <CommonsTheLoading />
  </div>
  
  <div v-else class="space-y-6">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Envío por Template y Grupos</h1>
        <p class="page-description">Selecciona un template y grupos de leads para envío masivo</p>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 section-spacing">
      <StatCard 
        :value="availableTemplates.length" 
        label="templates masivos" 
        icon="heroicons:document-text" 
      />
      <StatCard 
        :value="availableGroups.length" 
        label="grupos de leads" 
        icon="heroicons:user-group" 
      />
      <StatCard 
        :value="selectedGroupsLeadCount" 
        label="leads seleccionados" 
        icon="heroicons:users" 
      />
      <StatCard 
        :value="`${readyToSend ? '✓' : '○'}`" 
        label="listo para envío" 
        icon="heroicons:paper-airplane" 
      />
    </div>

    <!-- Template Selection -->
    <UiCard class="section-spacing">
      <UiCardHeader>
        <UiCardTitle>1. Seleccionar Template</UiCardTitle>
      </UiCardHeader>
      <UiCardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Template Selector -->
          <div>
            <label class="block text-sm font-medium mb-2">Template Masivo</label>
            <select
              v-model="selectedTemplateId"
              class="w-full h-10 p-2 border border-border bg-background rounded"
              @change="loadTemplateData"
            >
              <option value="">Selecciona un template masivo...</option>
              <option v-for="template in availableTemplates" :key="template.id" :value="template.id">
                {{ template.name }}
              </option>
            </select>
          </div>

          <!-- Template Info -->
          <div v-if="selectedTemplate">
            <label class="block text-sm font-medium mb-2">Información del Template</label>
            <div class="p-3 bg-muted/30 rounded border">
              <div class="text-sm font-medium">{{ selectedTemplate.name }}</div>
              <div class="text-xs text-muted-foreground mt-1">
                Versión {{ selectedTemplate.version_number }} • 
                {{ selectedTemplate.pair_type || 'Template individual' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Template Preview -->
        <div v-if="selectedTemplate" class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-2">Asunto</label>
            <div class="p-3 bg-muted/30 rounded border text-sm">
              {{ selectedTemplate.subject_template || 'Sin asunto definido' }}
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Contenido (Vista Previa)</label>
            <div class="max-h-48 overflow-y-auto p-3 bg-muted/30 rounded border">
              <div 
                v-html="selectedTemplate.content" 
                class="prose prose-sm max-w-none"
              ></div>
            </div>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <!-- Groups Selection -->
    <UiCard>
      <UiCardHeader>
        <UiCardTitle>2. Seleccionar Grupos de Leads</UiCardTitle>
      </UiCardHeader>
      <UiCardContent class="space-y-4">
        <!-- Groups List -->
        <div v-if="availableGroups.length > 0" class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label 
              v-for="group in availableGroups" 
              :key="group.id"
              class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
              :class="{ 'bg-primary/10 border-primary': selectedGroupIds.includes(group.id) }"
            >
              <input
                type="checkbox"
                :value="group.id"
                v-model="selectedGroupIds"
                class="sr-only"
              />
              <div class="flex-1">
                <div class="font-medium text-sm">{{ group.name }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ group.member_count || 0 }} leads
                </div>
                <div v-if="group.description" class="text-xs text-muted-foreground mt-1">
                  {{ group.description }}
                </div>
              </div>
              <div v-if="selectedGroupIds.includes(group.id)" class="text-primary">
                ✓
              </div>
            </label>
          </div>

          <!-- Selected Groups Summary -->
          <div v-if="selectedGroupIds.length > 0" class="mt-4 p-4 bg-blue-50 rounded-lg">
            <div class="text-sm font-medium mb-2">
              Grupos seleccionados ({{ selectedGroupIds.length }})
            </div>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="groupId in selectedGroupIds" 
                :key="groupId"
                class="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded"
              >
                {{ getGroupName(groupId) }}
                <button @click="removeGroup(groupId)" class="hover:text-destructive">
                  ×
                </button>
              </span>
            </div>
            <div class="text-sm text-muted-foreground mt-2">
              Total aproximado de leads: {{ selectedGroupsLeadCount }}
            </div>
          </div>
        </div>

        <CommonsEmptyState 
          v-else
          icon-name="heroicons:user-group"
          title="No hay grupos disponibles"
          description="Crea grupos de leads desde la página de gestión de grupos"
        />
        
        <!-- Empty state for templates -->
        <div v-if="availableTemplates.length === 0 && !loading" class="text-center py-8">
          <CommonsEmptyState 
            icon-name="heroicons:document-text"
            title="No hay templates masivos"
            description="Crea templates de tipo 'masivo' para envío a grupos"
          />
        </div>
      </UiCardContent>
    </UiCard>

    <!-- Send Configuration & Summary -->
    <UiCard v-if="readyToSend">
      <UiCardHeader>
        <UiCardTitle>3. Configurar y Enviar</UiCardTitle>
      </UiCardHeader>
      <UiCardContent class="space-y-4">
        <!-- Configuration Settings -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Campaign Name - Solo para templates pair -->
          <div v-if="requiresCampaign">
            <label class="block text-sm font-medium mb-2">Nombre de la Campaña (Requerido)</label>
            <UiInput
              v-model="campaignName"
              placeholder="Ej: Campaña Email + Landing"
              class="h-10"
            />
            <p class="text-xs text-muted-foreground mt-1">
              Requerido para templates que incluyen landing page
            </p>
          </div>

          <!-- Template Type Info - Solo para templates simples -->
          <div v-if="isSimpleMassiveTemplate" class="flex items-center p-3 bg-green-50 border border-green-200 rounded">
            <div class="text-green-600 mr-3">✓</div>
            <div>
              <div class="text-sm font-medium text-green-800">Template Simple</div>
              <div class="text-xs text-green-600">No requiere campaña, envío directo</div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Remitente</label>
            <div class="flex items-center p-3 bg-muted/30 rounded border h-10">
              <Icon name="heroicons:at-symbol" class="w-4 h-4 mr-2 text-primary" />
              <span class="text-sm">{{ senderEmail }}</span>
              <span v-if="selectedTemplate?.sender_email" class="ml-2 text-xs text-green-600">(del template)</span>
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              Email tomado automáticamente del template seleccionado
            </p>
          </div>
        </div>

        <!-- Summary -->
        <div class="bg-muted/30 rounded-lg p-4 space-y-3">
          <h4 class="font-medium">Resumen del Envío</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="text-muted-foreground">Template:</div>
            <div class="font-medium">{{ selectedTemplate?.name || 'No seleccionado' }}</div>
            
            <div class="text-muted-foreground">Tipo:</div>
            <div class="font-medium">
              <span v-if="isSimpleMassiveTemplate" class="text-green-600">Simple Masivo</span>
              <span v-else-if="requiresCampaign" class="text-blue-600">Pair (Email + Landing)</span>
              <span v-else>No seleccionado</span>
            </div>
            
            <div v-if="requiresCampaign" class="text-muted-foreground">Campaña:</div>
            <div v-if="requiresCampaign" class="font-medium">{{ campaignName || 'No especificada' }}</div>
            
            <div class="text-muted-foreground">Grupos:</div>
            <div class="font-medium">{{ selectedGroupIds.length }} grupos</div>
            
            <div class="text-muted-foreground">Leads aproximados:</div>
            <div class="font-medium">{{ selectedGroupsLeadCount }} destinatarios</div>
            
            <div class="text-muted-foreground">Asunto:</div>
            <div class="font-medium">{{ selectedTemplate?.subject_template || 'Sin asunto' }}</div>
            
            <div class="text-muted-foreground">Remitente:</div>
            <div class="font-medium">{{ senderEmail }}</div>
          </div>
        </div>

        <!-- Sending Progress -->
        <div v-if="sendingProgress.isActive" class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="font-medium">{{ sendingProgress.message }}</span>
            <span class="text-muted-foreground">
              {{ sendingProgress.sent }} / {{ sendingProgress.total }}
            </span>
          </div>
          <div class="w-full bg-muted rounded-full h-2">
            <div
              class="bg-primary h-2 rounded-full transition-all duration-300"
              :style="{ width: `${sendingProgress.total > 0 ? (sendingProgress.sent / sendingProgress.total) * 100 : 0}%` }"
            ></div>
          </div>
          <div v-if="sendingProgress.currentEmail" class="text-sm text-muted-foreground">
            Enviando a: {{ sendingProgress.currentEmail }}
          </div>
          <div v-if="sendingProgress.errors.length > 0" class="text-destructive text-sm">
            {{ sendingProgress.errors.length }} errores encontrados
          </div>
        </div>

        <!-- Send Results -->
        <div v-if="sendingResults" class="space-y-4">
          <div class="p-4 rounded-lg" :class="sendingResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
            <div class="font-medium" :class="sendingResults.success ? 'text-green-800' : 'text-red-800'">
              {{ sendingResults.message }}
            </div>
            <div class="text-sm mt-2" :class="sendingResults.success ? 'text-green-600' : 'text-red-600'">
              Enviados: {{ sendingResults.data?.summary.sent || 0 }} • 
              Fallidos: {{ sendingResults.data?.summary.failed || 0 }}
            </div>
            <div v-if="sendingResults.data?.groupStats" class="mt-3">
              <div class="text-sm font-medium mb-2">Estadísticas por grupo:</div>
              <div class="text-xs space-y-1">
                <div v-for="(stats, groupName) in sendingResults.data.groupStats" :key="groupName">
                  <strong>{{ groupName }}:</strong> {{ stats.sent }} enviados, {{ stats.failed }} fallidos
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Send Button -->
        <div class="flex justify-end">
          <UiButton
            @click="sendToGroups"
            :disabled="!readyToSend || sendingProgress.isActive"
            class="px-8 h-10"
          >
            <div v-if="sendingProgress.isActive" class="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
            {{ sendingProgress.isActive ? 'Enviando...' : 'Enviar a Grupos' }}
          </UiButton>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from '@/composables/useToast'
import StatCard from '@/components/Commons/StatCard.vue'

const toast = useToast()

// Loading state
const loading = ref(true)

// Templates
const availableTemplates = ref([])
const selectedTemplateId = ref('')
const selectedTemplate = ref(null)

// Groups
const availableGroups = ref([])
const selectedGroupIds = ref([])

// Send configuration
const campaignName = ref('')
const senderEmail = ref('noreply@warolabs.com')

// Sending state
const sendingProgress = ref({
  isActive: false,
  sent: 0,
  total: 0,
  errors: [],
  currentEmail: null,
  message: 'Preparando envío...'
})
const sendingResults = ref(null)

// SSE connection
let eventSource = null
const sessionId = ref(null)

// Computed properties
const readyToSend = computed(() => {
  const hasTemplate = selectedTemplateId.value
  const hasGroups = selectedGroupIds.value.length > 0
  const hasCampaignIfRequired = !requiresCampaign.value || campaignName.value
  
  return hasTemplate && hasGroups && hasCampaignIfRequired
})

const selectedGroupsLeadCount = computed(() => {
  return selectedGroupIds.value.reduce((total, groupId) => {
    const group = availableGroups.value.find(g => g.id === groupId)
    return total + (group?.member_count || 0)
  }, 0)
})

const requiresCampaign = computed(() => {
  // Solo los templates de tipo pair requieren campaña
  return selectedTemplate.value?.is_pair === true
})

const isSimpleMassiveTemplate = computed(() => {
  // Template individual masivo
  return selectedTemplate.value && !selectedTemplate.value.is_pair && selectedTemplate.value.template_type === 'massive_email'
})

// Methods
const loadTemplates = async () => {
  try {
    const response = await $fetch('/api/templates/massive')
    availableTemplates.value = response.data || []
  } catch (error) {
    console.error('Error loading templates:', error)
    toast.error('Error al cargar templates')
  }
}

const loadGroups = async () => {
  try {
    const response = await $fetch('/api/lead-groups')
    availableGroups.value = response.data || []
  } catch (error) {
    console.error('Error loading groups:', error)
    toast.error('Error al cargar grupos')
  }
}

const loadTemplateData = async () => {
  if (!selectedTemplateId.value) {
    selectedTemplate.value = null
    senderEmail.value = 'noreply@warolabs.com' // Reset to default
    return
  }

  try {
    const response = await $fetch(`/api/templates/${selectedTemplateId.value}`)
    selectedTemplate.value = response.data
    
    // Usar automáticamente el email del template
    if (selectedTemplate.value.sender_email) {
      senderEmail.value = selectedTemplate.value.sender_email
    }
  } catch (error) {
    console.error('Error loading template:', error)
    toast.error('Error al cargar datos del template')
  }
}

const getGroupName = (groupId) => {
  const group = availableGroups.value.find(g => g.id === groupId)
  return group?.name || 'Grupo no encontrado'
}

const removeGroup = (groupId) => {
  const index = selectedGroupIds.value.indexOf(groupId)
  if (index > -1) {
    selectedGroupIds.value.splice(index, 1)
  }
}

// SSE Functions
const connectToProgressStream = () => {
  if (!sessionId.value) return

  const sseUrl = `/api/campaign/send-progress?sessionId=${sessionId.value}`
  eventSource = new EventSource(sseUrl)

  eventSource.onopen = () => {
    console.log('SSE connection opened')
  }

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      console.log('SSE progress update:', data)

      switch (data.type) {
        case 'connected':
          console.log('SSE connected successfully')
          break

        case 'start':
          sendingProgress.value = {
            isActive: true,
            sent: data.sent,
            total: data.total,
            errors: [],
            currentEmail: null,
            message: data.message
          }
          break

        case 'progress':
          sendingProgress.value.sent = data.sent
          sendingProgress.value.total = data.total
          sendingProgress.value.message = data.message
          sendingProgress.value.currentEmail = data.current?.email || null
          break

        case 'complete':
          sendingProgress.value.isActive = false
          sendingResults.value = {
            success: true,
            message: data.message,
            data: {
              summary: data.summary,
              groupStats: data.groupStats
            }
          }
          toast.success('Emails enviados exitosamente')
          disconnectProgressStream()
          
          // Reset form
          selectedTemplateId.value = ''
          selectedTemplate.value = null
          selectedGroupIds.value = []
          campaignName.value = ''
          break

        case 'error':
          sendingProgress.value.isActive = false
          sendingResults.value = {
            success: false,
            message: data.message,
            error: data.error
          }
          toast.error('Error al enviar emails')
          disconnectProgressStream()
          break
      }
    } catch (error) {
      console.error('Error parsing SSE data:', error)
    }
  }

  eventSource.onerror = (error) => {
    console.error('SSE error:', error)
    toast.error('Error en la conexión de progreso')
    disconnectProgressStream()
  }
}

const disconnectProgressStream = () => {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
}

const generateSessionId = () => {
  return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now()
}

const sendToGroups = async () => {
  if (!readyToSend.value) return

  // Generate session ID and connect to SSE
  sessionId.value = generateSessionId()
  
  // Initialize progress state
  sendingProgress.value = {
    isActive: true,
    sent: 0,
    total: selectedGroupsLeadCount.value,
    errors: [],
    currentEmail: null,
    message: 'Conectando...'
  }
  sendingResults.value = null

  // Connect to progress stream
  connectToProgressStream()

  try {
    const payload = {
      templateId: selectedTemplateId.value,
      leadGroupIds: selectedGroupIds.value,
      sender: senderEmail.value,
      sessionId: sessionId.value
    }

    // Solo agregar campaignName si es requerido (template pair) y está presente
    if (requiresCampaign.value && campaignName.value) {
      payload.campaignName = campaignName.value
    }

    // Start the sending process (it will emit progress via SSE)
    await $fetch('/api/campaign/send-to-groups', {
      method: 'POST',
      body: payload
    })

    // The SSE will handle the rest of the flow

  } catch (error) {
    console.error('Error sending emails:', error)
    sendingProgress.value.isActive = false
    sendingResults.value = {
      success: false,
      message: 'Error al enviar emails',
      error: error.message
    }
    toast.error('Error al enviar emails')
    disconnectProgressStream()
  }
}

// Initialize
onMounted(async () => {
  try {
    await Promise.all([
      loadTemplates(),
      loadGroups()
    ])
  } finally {
    loading.value = false
  }
})

// Cleanup
onUnmounted(() => {
  disconnectProgressStream()
})
</script>