<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="p-6 border-b sticky top-0 bg-white z-10">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold">Métricas de Leads</h2>
            <button
              @click="$emit('close')"
              class="action-button"
            >
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="p-6 border-b bg-gray-50">
          <div class="grid grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                v-model="filters.start_date"
                type="date"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                v-model="filters.end_date"
                type="date"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Agrupar Por
              </label>
              <select
                v-model="groupBy"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="interaction_type">Tipo de Interacción</option>
                <option value="source">Fuente</option>
                <option value="medium">Medio</option>
                <option value="campaign">Campaña</option>
                <option value="date">Fecha</option>
              </select>
            </div>
            
            <div class="flex items-end">
              <button
                @click="fetchAnalytics"
                class="btn-primary w-full"
                :disabled="loading"
              >
                <Icon v-if="loading" name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
                <span v-else>Aplicar Filtros</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <Icon name="heroicons:arrow-path" class="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p class="text-gray-500">Cargando métricas...</p>
          </div>

          <!-- Metrics Display -->
          <div v-else-if="analytics">
            <!-- Overall Metrics -->
            <div class="grid grid-cols-4 gap-4 mb-8">
              <div class="bg-blue-50 rounded-lg p-4">
                <p class="text-sm text-blue-600 mb-1">Total Interacciones</p>
                <p class="text-2xl font-bold text-blue-900">
                  {{ analytics.overall_metrics?.total_interactions || 0 }}
                </p>
              </div>
              
              <div class="bg-green-50 rounded-lg p-4">
                <p class="text-sm text-green-600 mb-1">Leads Únicos</p>
                <p class="text-2xl font-bold text-green-900">
                  {{ analytics.overall_metrics?.unique_leads || 0 }}
                </p>
              </div>
              
              <div class="bg-purple-50 rounded-lg p-4">
                <p class="text-sm text-purple-600 mb-1">Fuentes Únicas</p>
                <p class="text-2xl font-bold text-purple-900">
                  {{ analytics.overall_metrics?.unique_sources || 0 }}
                </p>
              </div>
              
              <div class="bg-orange-50 rounded-lg p-4">
                <p class="text-sm text-orange-600 mb-1">Campañas Únicas</p>
                <p class="text-2xl font-bold text-orange-900">
                  {{ analytics.overall_metrics?.unique_campaigns || 0 }}
                </p>
              </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-2 gap-6 mb-8">
              <!-- Interaction Types Chart -->
              <div class="bg-white border rounded-lg p-4">
                <h3 class="font-semibold mb-4">Tipos de Interacción</h3>
                <div class="space-y-3">
                  <div 
                    v-for="type in analytics.interaction_types" 
                    :key="type.interaction_type"
                    class="flex items-center justify-between"
                  >
                    <div class="flex items-center gap-2">
                      <Icon 
                        :name="getInteractionIcon(type.interaction_type)" 
                        class="w-5 h-5 text-gray-600" 
                      />
                      <span class="text-sm">{{ formatInteractionType(type.interaction_type) }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold">{{ type.count }}</span>
                      <span class="text-xs text-gray-500">({{ type.percentage }}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Top Sources Chart -->
              <div class="bg-white border rounded-lg p-4">
                <h3 class="font-semibold mb-4">Top Fuentes</h3>
                <div class="space-y-3">
                  <div 
                    v-for="source in analytics.top_sources.slice(0, 5)" 
                    :key="source.source"
                    class="flex items-center justify-between"
                  >
                    <span class="text-sm">{{ source.source || 'Directo' }}</span>
                    <div class="flex items-center gap-4">
                      <span class="text-sm text-gray-500">{{ source.unique_leads }} leads</span>
                      <span class="text-sm font-semibold">{{ source.interactions }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Analytics Table -->
            <div class="bg-white border rounded-lg overflow-hidden">
              <div class="p-4 border-b bg-gray-50">
                <h3 class="font-semibold">Detalle de Análisis</h3>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {{ getGroupByLabel() }}
                      </th>
                      <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Interacciones
                      </th>
                      <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Leads Únicos
                      </th>
                      <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Primera Int.
                      </th>
                      <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Última Int.
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr 
                      v-for="row in analytics.analytics" 
                      :key="row.group_key"
                      class="hover:bg-gray-50"
                    >
                      <td class="px-4 py-3 text-sm">
                        {{ formatGroupKey(row.group_key) }}
                      </td>
                      <td class="px-4 py-3 text-sm text-right font-medium">
                        {{ row.total_interactions }}
                      </td>
                      <td class="px-4 py-3 text-sm text-right">
                        {{ row.unique_leads }}
                      </td>
                      <td class="px-4 py-3 text-sm text-right text-gray-500">
                        {{ formatDate(row.first_interaction) }}
                      </td>
                      <td class="px-4 py-3 text-sm text-right text-gray-500">
                        {{ formatDate(row.last_interaction) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useLeadGroups } from '~/composables/useLeadGroups'

const emit = defineEmits(['close'])

const { fetchInteractionAnalytics } = useLeadGroups()

const loading = ref(false)
const analytics = ref(null)
const groupBy = ref('interaction_type')

const filters = reactive({
  start_date: '',
  end_date: ''
})

const fetchAnalytics = async () => {
  loading.value = true
  try {
    const response = await fetchInteractionAnalytics(groupBy.value, filters)
    analytics.value = response.data
  } catch (error) {
    console.error('Error fetching analytics:', error)
  } finally {
    loading.value = false
  }
}

const getGroupByLabel = () => {
  const labels = {
    'interaction_type': 'Tipo de Interacción',
    'source': 'Fuente',
    'medium': 'Medio',
    'campaign': 'Campaña',
    'date': 'Fecha'
  }
  return labels[groupBy.value] || 'Grupo'
}

const getInteractionIcon = (type) => {
  const icons = {
    'lead_capture': 'heroicons:user-plus',
    'email_open': 'heroicons:envelope-open',
    'email_click': 'heroicons:cursor-arrow-rays',
    'page_view': 'heroicons:eye',
    'form_submit': 'heroicons:document-check'
  }
  return icons[type] || 'heroicons:question-mark-circle'
}

const formatInteractionType = (type) => {
  const labels = {
    'lead_capture': 'Captura de Lead',
    'email_open': 'Apertura de Email',
    'email_click': 'Click en Email',
    'page_view': 'Vista de Página',
    'form_submit': 'Envío de Formulario'
  }
  return labels[type] || type
}

const formatGroupKey = (key) => {
  if (!key) return 'Sin valor'
  if (groupBy.value === 'date') {
    return new Date(key).toLocaleDateString()
  }
  if (groupBy.value === 'interaction_type') {
    return formatInteractionType(key)
  }
  return key
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  fetchAnalytics()
})
</script>