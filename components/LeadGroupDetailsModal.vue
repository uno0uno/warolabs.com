<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="group" class="modal-overlay flex items-center justify-center p-4">
      <Transition
        enter-active-class="transition-all duration-300 ease-out delay-100"
        enter-from-class="opacity-0 transform scale-95 -translate-y-4"
        enter-to-class="opacity-100 transform scale-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 transform scale-100 translate-y-0"
        leave-to-class="opacity-0 transform scale-95 -translate-y-4"
      >
        <div v-if="group" class="modal-content max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg">
          <div class="modal-header">
            <div>
              <h2 class="modal-title flex items-center gap-2">
                <Icon name="heroicons:user-group" class="w-5 h-5 text-primary" />
                {{ group.name }}
              </h2>
              <p class="text-sm text-muted-foreground mt-1">{{ group.description }}</p>
            </div>
            <button @click="$emit('close')" class="action-button">
              <Icon name="heroicons:x-mark" class="w-4 h-4" />
            </button>
          </div>

          <div class="modal-body space-y-6">

            <!-- Stats Cards -->
            <div class="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
          <div class="stat-card">
            <p class="stat-label">Total Miembros</p>
            <p class="stat-value">{{ group.member_count }}</p>
          </div>
          
          <div class="stat-card">
            <p class="stat-label">Tasa de Conversión</p>
            <p class="stat-value">{{ group.conversion_rate }}%</p>
          </div>
          
          <div class="stat-card">
            <p class="stat-label">Verificados</p>
            <p class="stat-value">{{ group.verified_count }}</p>
          </div>
          
          <div class="stat-card">
            <p class="stat-label">Actividad Reciente</p>
            <p class="stat-value">
              {{ group.recent_activity?.recent_opens || 0 }}
            </p>
          </div>
            </div>

            <!-- Tabs -->
            <div class="border-b">
          <div class="flex px-6">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>
            </div>

            <!-- Tab Content -->
            <div>
              <!-- Members Tab -->
              <div v-if="activeTab === 'members'">
                <div class="mb-4">
                  <h3 class="text-lg font-semibold">Miembros del Grupo</h3>
                </div>

                <!-- Loading State -->
                <div v-if="loadingMembers" class="empty-state">
                  <Icon name="heroicons:arrow-path" class="loading-spinner mx-auto mb-2" />
                  <p class="text-muted-foreground">Cargando miembros...</p>
                </div>

                <!-- Members Table -->
                <div v-else-if="members && members.length > 0" class="overflow-x-auto">
                  <table class="table-base">
                    <thead class="table-header">
                      <tr>
                        <th class="table-header-cell">
                          Email
                        </th>
                        <th class="table-header-cell">
                          Nombre
                        </th>
                        <th class="table-header-cell">
                          Empresa
                        </th>
                        <th class="table-header-cell text-center">
                          Engagement
                        </th>
                        <th class="table-header-cell text-center">
                          Estado
                        </th>
                        <th class="table-header-cell text-center">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody class="table-body">
                      <tr v-for="member in members" :key="member.lead_id" class="table-row">
                        <td class="table-cell">{{ member.email }}</td>
                        <td class="table-cell">{{ member.name || '-' }}</td>
                        <td class="table-cell">{{ member.company || '-' }}</td>
                        <td class="table-cell text-center">
                          <span 
                            :class="[
                              'badge-base',
                              getEngagementClass(member.engagement_level)
                            ]"
                          >
                            {{ formatEngagementLevel(member.engagement_level) }}
                          </span>
                        </td>
                        <td class="table-cell text-center">
                          <span v-if="member.is_verified" class="text-success">
                            <Icon name="heroicons:check-circle" class="w-5 h-5" />
                          </span>
                          <span v-else class="text-muted-foreground">
                            <Icon name="heroicons:x-circle" class="w-5 h-5" />
                          </span>
                        </td>
                        <td class="table-cell text-center">
                          <button
                            @click="viewLeadJourney(member.lead_id)"
                            class="action-button"
                            title="Ver Journey"
                          >
                            <Icon name="heroicons:chart-bar" class="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Empty State -->
                <div v-else class="empty-state">
                  <Icon name="heroicons:users" class="empty-state-icon" />
                  <p class="empty-state-description">No hay miembros en este grupo</p>
                </div>
              </div>

              <!-- Filters Tab -->
              <div v-if="activeTab === 'filters'">
                <h3 class="text-lg font-semibold mb-4">Criterios del Grupo</h3>
                <div class="bg-muted/50 rounded-lg p-6">
                  <pre class="text-sm text-muted-foreground">{{ JSON.stringify(group.filters, null, 2) }}</pre>
                </div>
              </div>

              <!-- Activity Tab -->
              <div v-if="activeTab === 'activity'">
                <h3 class="text-lg font-semibold mb-4">Actividad Reciente</h3>
                
                <div class="space-y-4">
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-medium text-blue-900">Aperturas en últimos 7 días</p>
                        <p class="text-sm text-blue-700 mt-1">
                          {{ group.recent_activity?.recent_opens || 0 }} leads activos
                        </p>
                      </div>
                      <Icon name="heroicons:envelope-open" class="w-8 h-8 text-blue-500" />
                    </div>
                  </div>

                  <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-medium text-green-900">Clicks en últimos 7 días</p>
                        <p class="text-sm text-green-700 mt-1">
                          {{ group.recent_activity?.recent_clicks || 0 }} leads comprometidos
                        </p>
                      </div>
                      <Icon name="heroicons:cursor-arrow-rays" class="w-8 h-8 text-green-500" />
                    </div>
                  </div>

                  <div class="bg-muted/50 border border-muted rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-medium text-foreground">Última actividad</p>
                        <p class="text-sm text-muted-foreground mt-1">
                          {{ formatLastActivity(group.recent_activity?.last_activity) }}
                        </p>
                      </div>
                      <Icon name="heroicons:clock" class="w-8 h-8 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer flex-col sm:flex-row">
            <button class="btn-destructive" @click="deleteGroup">
              Eliminar Grupo
            </button>
            <div class="flex gap-3">
              <button class="btn-outline" @click="editGroup">
                Editar
              </button>
              <button class="btn-primary" @click="sendCampaign">
                Enviar Campaña
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLeadGroups } from '~/composables/useLeadGroups'

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const { fetchLeadMetrics, fetchLeadJourney } = useLeadGroups()

const activeTab = ref('members')
const loadingMembers = ref(false)
const members = ref([])

const tabs = [
  { id: 'members', label: 'Miembros' },
  { id: 'filters', label: 'Filtros' },
  { id: 'activity', label: 'Actividad' }
]

const loadMembers = async () => {
  loadingMembers.value = true
  try {
    const response = await fetchLeadMetrics(props.group.filters)
    members.value = response.data?.leads || []
  } catch (error) {
    console.error('Error loading members:', error)
  } finally {
    loadingMembers.value = false
  }
}

const getEngagementClass = (level) => {
  const classes = {
    'highly_engaged': 'badge-highly-engaged',
    'engaged': 'badge-engaged',
    'interested': 'badge-interested',
    'cold': 'badge-cold'
  }
  return classes[level] || 'badge-cold'
}

const formatEngagementLevel = (level) => {
  const labels = {
    'highly_engaged': 'Alto',
    'engaged': 'Medio',
    'interested': 'Bajo',
    'cold': 'Frío'
  }
  return labels[level] || level
}

const formatLastActivity = (date) => {
  if (!date) return 'Sin actividad'
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  return `Hace ${days} días`
}

const viewLeadJourney = async (leadId) => {
  // Abrir modal o navegar a página de journey
  const journey = await fetchLeadJourney(leadId)
  console.log('Lead journey:', journey)
}


const deleteGroup = () => {
  if (confirm('¿Estás seguro de eliminar este grupo?')) {
    // Implementar eliminación
    console.log('Deleting group...')
  }
}

const editGroup = () => {
  // Implementar edición
  console.log('Editing group...')
}

const sendCampaign = () => {
  navigateTo({
    path: '/marketing/sender',
    query: { groupId: props.group.id }
  })
}

onMounted(() => {
  loadMembers()
})
</script>