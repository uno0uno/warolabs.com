<template>
  <div class="dashboard-page">
    <!-- Loading State for initial load -->
    <div v-if="initialLoading">
      <CommonsTheLoading />
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Header -->
      <div class="page-header">
        <div>
          <h2 class="page-title">Métricas de Leads</h2>
          <p class="page-description">Analiza el comportamiento y engagement de tus leads</p>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="card-base p-6 section-spacing">
      <h3 class="section-title">Filtros</h3>
      <div class="grid grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">
            Fecha Inicio
          </label>
          <input
            v-model="filters.start_date"
            type="date"
            class="input-base"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">
            Fecha Fin
          </label>
          <input
            v-model="filters.end_date"
            type="date"
            class="input-base"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">
            Agrupar Por
          </label>
          <select
            v-model="groupBy"
            @change="fetchAnalytics"
            class="input-base"
          >
            <option value="interaction_type">Tipo de Interacción</option>
            <option value="source">Fuente</option>
            <option value="medium">Medio</option>
            <option value="campaign">Campaña</option>
            <option value="date">Fecha</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Periodo Rápido
          </label>
          <select
            v-model="quickPeriod"
            @change="setQuickPeriod"
            class="input-base"
          >
            <option value="">Personalizado</option>
            <option value="today">Hoy</option>
            <option value="yesterday">Ayer</option>
            <option value="last7days">Últimos 7 días</option>
            <option value="last30days">Últimos 30 días</option>
            <option value="thisMonth">Este mes</option>
            <option value="lastMonth">Mes pasado</option>
          </select>
        </div>
        
        <div class="flex items-end">
          <button
            @click="fetchAnalytics"
            class="btn-primary w-full flex items-center justify-center gap-2"
            :disabled="loading"
          >
            <Icon v-if="loading" name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
            <span v-else>Aplicar Filtros</span>
          </button>
        </div>
      </div>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 section-spacing">
        <StatCard 
          :value="formatNumber(analytics?.overall_metrics?.total_interactions || 0)" 
          label="interacciones totales" 
          icon="heroicons:chart-bar" 
        />
        <StatCard 
          :value="formatNumber(analytics?.overall_metrics?.unique_leads || 0)" 
          label="leads únicos" 
          icon="heroicons:users" 
        />
        <StatCard 
          :value="formatNumber(analytics?.overall_metrics?.unique_sources || 0)" 
          label="fuentes de tráfico" 
          icon="heroicons:globe-alt" 
        />
        <StatCard 
          :value="formatNumber(analytics?.overall_metrics?.unique_campaigns || 0)" 
          label="campañas activas" 
          icon="heroicons:megaphone" 
        />
      </div>

      <!-- Charts and Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 section-spacing">
      <!-- Interaction Types Chart -->
      <div class="card-base p-6">
        <h3 class="text-lg font-semibold mb-4">Distribución de Interacciones</h3>
        <div v-if="analytics?.interaction_types?.length > 0" class="space-y-4">
          <div 
            v-for="type in analytics.interaction_types" 
            :key="type.interaction_type"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <Icon 
                  :name="getInteractionIcon(type.interaction_type)" 
                  class="w-5 h-5 text-gray-600" 
                />
                <span class="text-sm font-medium">{{ formatInteractionType(type.interaction_type) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold">{{ type.count }}</span>
                <span class="text-xs text-gray-500">({{ type.percentage }}%)</span>
              </div>
            </div>
            <!-- Progress bar -->
            <div class="w-full bg-muted rounded-full h-2">
              <div 
                class="bg-primary h-2 rounded-full transition-all duration-500"
                :style="`width: ${type.percentage}%`"
              />
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          No hay datos de interacciones
        </div>
      </div>

      <!-- Top Sources -->
      <div class="card-base p-6">
        <h3 class="text-lg font-semibold mb-4">Top Fuentes de Tráfico</h3>
        <div v-if="analytics?.top_sources?.length > 0" class="space-y-3">
          <div 
            v-for="(source, index) in analytics.top_sources.slice(0, 10)" 
            :key="source.source"
            class="flex items-center justify-between p-3 hover:bg-accent transition-colors"
          >
            <div class="flex items-center gap-3">
              <span class="text-lg font-bold text-gray-400">{{ index + 1 }}</span>
              <div>
                <p class="font-medium">{{ source.source || 'Directo' }}</p>
                <p class="text-xs text-gray-500">{{ source.unique_leads }} leads únicos</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-semibold">{{ source.interactions }}</p>
              <p class="text-xs text-gray-500">interacciones</p>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          No hay datos de fuentes
        </div>
      </div>
      </div>

      <!-- Detailed Analytics Table -->
      <div class="card-base section-spacing">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold">Análisis Detallado</h3>
        <p class="text-sm text-gray-600 mt-1">
          Agrupado por: {{ getGroupByLabel() }}
        </p>
      </div>
      
      <div v-if="loading" class="p-12 text-center">
        <Icon name="heroicons:arrow-path" class="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
        <p class="text-gray-500">Cargando datos...</p>
      </div>

      <div v-else-if="analytics?.analytics?.length > 0" class="overflow-x-auto">
        <table class="table-base">
          <thead class="table-header">
            <tr>
              <th class="table-header-cell">
                {{ getGroupByLabel() }}
              </th>
              <th class="table-header-cell text-right">
                Interacciones
              </th>
              <th class="table-header-cell text-right">
                Leads Únicos
              </th>
              <th class="table-header-cell text-right">
                Promedio por Lead
              </th>
              <th class="table-header-cell text-right">
                Primera Interacción
              </th>
              <th class="table-header-cell text-right">
                Última Interacción
              </th>
            </tr>
          </thead>
          <tbody class="table-body">
            <tr 
              v-for="row in analytics.analytics" 
              :key="row.group_key"
              class="table-row"
            >
              <td class="table-cell text-sm font-medium">
                {{ formatGroupKey(row.group_key) }}
              </td>
              <td class="table-cell text-sm text-right font-semibold">
                {{ formatNumber(row.total_interactions) }}
              </td>
              <td class="table-cell text-sm text-right">
                {{ formatNumber(row.unique_leads) }}
              </td>
              <td class="table-cell text-sm text-right">
                {{ row.unique_leads > 0 ? (row.total_interactions / row.unique_leads).toFixed(1) : '0' }}
              </td>
              <td class="table-cell text-sm text-right text-muted-foreground">
                {{ formatDate(row.first_interaction) }}
              </td>
              <td class="table-cell text-sm text-right text-muted-foreground">
                {{ formatDate(row.last_interaction) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="p-12 text-center">
        <Icon name="heroicons:chart-bar-square" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500">No hay datos para mostrar con los filtros seleccionados</p>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useLeadGroups } from '~/composables/useLeadGroups'
import { useToast } from '~/composables/useToast'
import StatCard from '@/components/Commons/StatCard.vue'

const { fetchInteractionAnalytics } = useLeadGroups()
const { showToast } = useToast()

const initialLoading = ref(true)
const loading = ref(false)
const analytics = ref(null)
const groupBy = ref('interaction_type')
const quickPeriod = ref('')

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
    showToast('Error al cargar las métricas', 'error')
  } finally {
    loading.value = false
  }
}

const setQuickPeriod = () => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  switch (quickPeriod.value) {
    case 'today':
      filters.start_date = today.toISOString().split('T')[0]
      filters.end_date = today.toISOString().split('T')[0]
      break
    case 'yesterday':
      filters.start_date = yesterday.toISOString().split('T')[0]
      filters.end_date = yesterday.toISOString().split('T')[0]
      break
    case 'last7days':
      const week = new Date(today)
      week.setDate(week.getDate() - 7)
      filters.start_date = week.toISOString().split('T')[0]
      filters.end_date = today.toISOString().split('T')[0]
      break
    case 'last30days':
      const month = new Date(today)
      month.setDate(month.getDate() - 30)
      filters.start_date = month.toISOString().split('T')[0]
      filters.end_date = today.toISOString().split('T')[0]
      break
    case 'thisMonth':
      filters.start_date = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
      filters.end_date = today.toISOString().split('T')[0]
      break
    case 'lastMonth':
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
      filters.start_date = lastMonth.toISOString().split('T')[0]
      filters.end_date = lastMonthEnd.toISOString().split('T')[0]
      break
  }
  
  fetchAnalytics()
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
    'form_submit': 'heroicons:document-check',
    'test': 'heroicons:beaker'
  }
  return icons[type] || 'heroicons:question-mark-circle'
}

const formatInteractionType = (type) => {
  const labels = {
    'lead_capture': 'Captura de Lead',
    'email_open': 'Apertura de Email',
    'email_click': 'Click en Email',
    'page_view': 'Vista de Página',
    'form_submit': 'Envío de Formulario',
    'test': 'Prueba'
  }
  return labels[type] || type
}

const formatGroupKey = (key) => {
  if (!key) return 'Sin valor'
  if (groupBy.value === 'date') {
    return new Date(key).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
  if (groupBy.value === 'interaction_type') {
    return formatInteractionType(key)
  }
  return key
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('es-ES').format(num)
}


// Set default date range to last 30 days
onMounted(async () => {
  quickPeriod.value = 'last30days'
  await setQuickPeriod()
  initialLoading.value = false
})
</script>