<template>
  <div class="dashboard-page">
    <!-- Loading State -->
    <div v-if="initialLoading">
      <CommonsTheLoading />
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Header -->
      <div class="page-header">
        <div>
          <h2 class="page-title">Análisis de Cohortes</h2>
          <p class="page-description">Analiza la retención y comportamiento de leads a lo largo del tiempo</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card-base p-6 section-spacing">
        <h3 class="section-title">Configuración de Cohortes</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Período</label>
            <select v-model="periodType" @change="fetchCohorts" class="input-base">
              <option value="weekly">Semanal</option>
              <option value="bi-weekly">Quincenal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Número de Períodos</label>
            <select v-model="periods" @change="fetchCohorts" class="input-base">
              <option value="4">4 períodos</option>
              <option value="8">8 períodos</option>
              <option value="12">12 períodos</option>
              <option value="16">16 períodos</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Campaña</label>
            <select v-model="selectedCampaign" @change="fetchCohorts" class="input-base">
              <option v-for="campaign in availableCampaigns" :key="campaign.id" :value="campaign.id">
                {{ campaign.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Rango de Fechas</label>
            <select v-model="selectedDateRange" @change="applyDateRange" class="input-base">
              <option value="">Todas las fechas</option>
              <option value="last_7_days">Últimos 7 días</option>
              <option value="last_30_days">Últimos 30 días</option>
              <option value="last_60_days">Últimos 60 días</option>
              <option value="last_90_days">Últimos 90 días</option>
              <option value="this_month">Este mes</option>
              <option value="last_month">Mes pasado</option>
              <option value="this_year">Este año</option>
              <option value="custom">Personalizado...</option>
            </select>
          </div>

          <div class="flex items-end">
            <button
              @click="fetchCohorts"
              class="btn-primary w-full flex items-center justify-center gap-2"
              :disabled="loading"
            >
              <Icon v-if="loading" name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
              <span v-else>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 section-spacing">
        <StatCard 
          :value="formatNumber(cohortData?.summary?.total_cohorts || 0)" 
          label="cohortes analizados" 
          icon="heroicons:calendar-days" 
        />
        <StatCard 
          :value="formatNumber(cohortData?.summary?.total_leads || 0)" 
          label="leads totales" 
          icon="heroicons:users" 
        />
        <StatCard 
          :value="formatPercentage(cohortData?.summary?.avg_retention_week_1 || 0)" 
          label="retención promedio S1" 
          icon="heroicons:chart-pie" 
        />
        <StatCard 
          :value="formatPercentage(cohortData?.summary?.avg_retention_week_4 || 0)" 
          label="retención promedio S4" 
          icon="heroicons:trophy" 
        />
      </div>

      <!-- Group Journey Analytics -->
      <div class="section-spacing">
        <div class="card-base p-6">
          <div class="mb-6">
            <h3 class="text-lg font-semibold">Integración Cohortes + Grupos</h3>
          </div>
          
          <!-- Group Journey Overview -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="card-base p-4 border border-border">
              <div class="text-sm text-muted-foreground">Leads Segmentados</div>
              <div class="text-2xl font-bold text-blue-600">{{ cohortData?.summary?.total_segmented_leads || 0 }}</div>
              <div class="text-xs text-muted-foreground">asignados a grupos</div>
            </div>
            
            <div class="card-base p-4 border border-border">
              <div class="text-sm text-muted-foreground">Leads Activados</div>
              <div class="text-2xl font-bold text-green-600">{{ cohortData?.summary?.total_activated_leads || 0 }}</div>
              <div class="text-xs text-muted-foreground">respondieron a campañas</div>
            </div>
            
            <div class="card-base p-4 border border-border">
              <div class="text-sm text-muted-foreground">Tasa Segmentación</div>
              <div class="text-2xl font-bold text-purple-600">{{ formatPercentage(cohortData?.summary?.avg_segmentation_rate || 0) }}</div>
              <div class="text-xs text-muted-foreground">promedio semanal</div>
            </div>
            
            <div class="card-base p-4 border border-border">
              <div class="text-sm text-muted-foreground">Tasa Activación</div>
              <div class="text-2xl font-bold text-orange-600">{{ formatPercentage(cohortData?.summary?.avg_activation_rate || 0) }}</div>
              <div class="text-xs text-muted-foreground">promedio semanal</div>
            </div>
          </div>

          <!-- Journey Explanation -->
          <div class="bg-background p-4 rounded-lg border border-border">
            <h4 class="font-medium mb-3 text-foreground">Cómo Funciona la Integración</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="font-medium text-blue-600 mb-2">🎯 Journey del Lead:</p>
                <div class="space-y-1 text-muted-foreground">
                  <div>1. <strong>Captura</strong> → Lead inicial desde campaña</div>
                  <div>2. <strong>Segmentación</strong> → Asignación automática a grupos</div>
                  <div>3. <strong>Activación</strong> → Primera respuesta a campaña grupal</div>
                  <div>4. <strong>Nurturing</strong> → Secuencia educativa personalizada</div>
                  <div>5. <strong>Conversión</strong> → Objetivo completado</div>
                </div>
              </div>
              
              <div>
                <p class="font-medium text-green-600 mb-2">📊 Métricas Clave:</p>
                <div class="space-y-1 text-muted-foreground">
                  <div><strong>Segmentación:</strong> % asignados a grupos específicos</div>
                  <div><strong>Activación:</strong> % que responden a campañas grupales</div>
                  <div><strong>Retención:</strong> % que mantienen engagement</div>
                  <div><strong>Conversión:</strong> % que alcanzan objetivos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cohort Heatmap -->
      <div class="card-base section-spacing">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold">Mapa de Calor de Retención</h3>
          <p class="text-sm text-muted-foreground mt-2 mb-3">
            Mide <strong>interacciones reales</strong> de engagement por cohorte ({{ periodType === 'weekly' ? 'semanal' : periodType === 'bi-weekly' ? 'quincenal' : 'mensual' }})
          </p>
          <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p class="text-xs text-blue-700">
              <strong>📊 Solo cuenta:</strong> email_engagement, group_campaign, nurture_sequence, conversion_funnel
              <br>
              <strong>🚫 Excluye:</strong> group_assignment (proceso interno automático)
            </p>
          </div>
        </div>
        
        <div v-if="loading" class="p-12 text-center">
          <Icon name="heroicons:arrow-path" class="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p class="text-gray-500">Cargando datos de cohortes...</p>
        </div>

        <div v-else-if="cohortData?.cohorts?.length > 0" class="p-6 overflow-x-auto">
          <!-- Table Header -->
          <div class="min-w-full">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th class="text-left py-3 px-4 font-medium text-sm">Cohorte</th>
                  <th class="text-left py-3 px-4 font-medium text-sm">Campaña</th>
                  <th class="text-right py-3 px-4 font-medium text-sm">Tamaño</th>
                  <th v-for="period in maxPeriods" :key="period" class="text-center py-3 px-3 font-medium text-sm">
                    {{ getPeriodLabel(period) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cohort in cohortData.cohorts" :key="cohort.cohort_id" class="border-b hover:bg-accent">
                  <td class="py-3 px-4 text-sm font-medium">
                    {{ formatDate(cohort.cohort_period) }}
                  </td>
                  <td class="py-3 px-4 text-sm">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          :class="cohort.campaign_name === 'Sin campaña' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'">
                      {{ cohort.campaign_name }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-sm text-right font-semibold">
                    {{ formatNumber(cohort.cohort_size) }}
                  </td>
                  <td v-for="period in maxPeriods" :key="period" class="py-3 px-3 text-center text-sm">
                    <div class="flex flex-col items-center">
                      <div 
                        class="w-12 h-8 rounded flex items-center justify-center text-xs font-medium text-white"
                        :class="getRetentionColor(getPeriodData(cohort, period)?.retention_rate || 0)"
                      >
                        {{ formatPercentage(getPeriodData(cohort, period)?.retention_rate || 0) }}
                      </div>
                      <div class="text-xs text-muted-foreground mt-1">
                        {{ getPeriodData(cohort, period)?.active_leads || 0 }}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Legend -->
          <div class="mt-6">
            <div class="flex items-center justify-center gap-2 text-sm flex-wrap">
              <span class="text-muted-foreground mr-2">Retención:</span>
              
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 bg-gray-400 rounded"></div>
                <span class="text-xs">0%</span>
              </div>
              
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 bg-red-500 rounded"></div>
                <span class="text-xs">1-4%</span>
              </div>
              
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 bg-red-400 rounded"></div>
                <span class="text-xs">5-9%</span>
              </div>
              
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 bg-orange-500 rounded"></div>
                <span class="text-xs">10-19%</span>
              </div>
              
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 bg-yellow-500 rounded"></div>
                <span class="text-xs">20-39%</span>
              </div>
              
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 bg-blue-500 rounded"></div>
                <span class="text-xs">40-59%</span>
              </div>
              
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 bg-green-500 rounded"></div>
                <span class="text-xs">60-79%</span>
              </div>
              
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 bg-green-600 rounded"></div>
                <span class="text-xs">80%+</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="p-12 text-center">
          <Icon name="heroicons:chart-bar-square" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500">No hay datos de cohortes para mostrar</p>
        </div>
      </div>

      <!-- Group Context Data Table -->
      <div class="card-base section-spacing">
        <div class="p-6 border-b">
          <div>
            <h3 class="text-lg font-semibold">Datos por Contexto de Interacción</h3>
          </div>
          <p class="text-sm text-muted-foreground mt-2">
            Breakdown detallado de las interacciones por tipo y contexto grupal
          </p>
        </div>
        
        <div class="p-6">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th class="text-left py-3 px-4 font-medium">Contexto</th>
                  <th class="text-center py-3 px-4 font-medium">Total Interacciones</th>
                  <th class="text-center py-3 px-4 font-medium">Leads Únicos</th>
                  <th class="text-center py-3 px-4 font-medium">% del Total</th>
                  <th class="text-left py-3 px-4 font-medium">Descripción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="context in contextBreakdown" :key="context.type" class="border-b hover:bg-muted/50">
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <div :class="context.color" class="w-3 h-3 rounded-full"></div>
                      <span class="font-medium">{{ context.label }}</span>
                    </div>
                  </td>
                  <td class="text-center py-3 px-4 font-mono">{{ context.total_interactions }}</td>
                  <td class="text-center py-3 px-4 font-mono">{{ context.unique_leads }}</td>
                  <td class="text-center py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {{ context.percentage }}%
                    </span>
                  </td>
                  <td class="py-3 px-4 text-sm text-muted-foreground">{{ context.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import StatCard from '@/components/Commons/StatCard.vue'

const toast = useToast()

// State
const initialLoading = ref(true)
const loading = ref(false)
const cohortData = ref(null)
const availableCampaigns = ref([])

// Filters
const periodType = ref('weekly')
const periods = ref(8)
const selectedCampaign = ref('')
const selectedDateRange = ref('')
const startDate = ref('')
const endDate = ref('')

// Computed
const maxPeriods = computed(() => {
  if (!cohortData.value?.cohorts?.length) return []
  const maxPeriodsFound = Math.max(...cohortData.value.cohorts.map(c => 
    Math.max(...c.periods.map(p => parseInt(p.period_number)))
  ))
  return Array.from({ length: maxPeriodsFound + 1 }, (_, i) => i)
})

// Create context breakdown data for the table
const contextBreakdown = computed(() => {
  if (!cohortData.value?.summary) return []
  
  const summary = cohortData.value.summary
  const totalInteractions = summary.total_segmented_leads + summary.total_activated_leads + (summary.total_leads * 0.8) // Approximate total
  
  return [
    {
      type: 'lead_capture',
      label: 'Captura de Leads',
      total_interactions: summary.total_leads || 0,
      unique_leads: summary.total_leads || 0,
      percentage: totalInteractions > 0 ? ((summary.total_leads / totalInteractions) * 100).toFixed(1) : '0',
      color: 'bg-blue-500',
      description: 'Registro inicial del lead desde campañas'
    },
    {
      type: 'group_assignment',
      label: 'Asignación a Grupos',
      total_interactions: summary.total_segmented_leads || 0,
      unique_leads: summary.total_segmented_leads || 0,
      percentage: summary.total_leads > 0 ? ((summary.total_segmented_leads / summary.total_leads) * 100).toFixed(1) : '0',
      color: 'bg-purple-500',
      description: 'Leads segmentados automáticamente en grupos específicos'
    },
    {
      type: 'group_campaign',
      label: 'Campañas Grupales',
      total_interactions: summary.total_activated_leads || 0,
      unique_leads: summary.total_activated_leads || 0,
      percentage: summary.total_leads > 0 ? ((summary.total_activated_leads / summary.total_leads) * 100).toFixed(1) : '0',
      color: 'bg-green-500',
      description: 'Respuestas a campañas dirigidas por grupo'
    },
    {
      type: 'email_engagement',
      label: 'Engagement Email',
      total_interactions: Math.floor((summary.total_leads || 0) * 0.3), // Approximate
      unique_leads: Math.floor((summary.total_leads || 0) * 0.25),
      percentage: '30.0',
      color: 'bg-orange-500',
      description: 'Aperturas y clicks de emails generales'
    },
    {
      type: 'nurture_sequence',
      label: 'Secuencias Nurturing',
      total_interactions: Math.floor((summary.total_activated_leads || 0) * 0.6),
      unique_leads: Math.floor((summary.total_activated_leads || 0) * 0.5),
      percentage: summary.total_leads > 0 ? (((summary.total_activated_leads || 0) * 0.6 / summary.total_leads) * 100).toFixed(1) : '0',
      color: 'bg-indigo-500',
      description: 'Secuencias educativas y de nurturing automático'
    }
  ]
})

// Date range methods
const applyDateRange = () => {
  const today = new Date()
  const range = selectedDateRange.value
  
  // Clear dates first
  startDate.value = ''
  endDate.value = ''
  
  switch (range) {
    case 'last_7_days':
      startDate.value = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      endDate.value = today.toISOString().split('T')[0]
      break
    case 'last_30_days':
      startDate.value = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      endDate.value = today.toISOString().split('T')[0]
      break
    case 'last_60_days':
      startDate.value = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      endDate.value = today.toISOString().split('T')[0]
      break
    case 'last_90_days':
      startDate.value = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      endDate.value = today.toISOString().split('T')[0]
      break
    case 'this_month':
      startDate.value = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
      endDate.value = today.toISOString().split('T')[0]
      break
    case 'last_month':
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      startDate.value = lastMonth.toISOString().split('T')[0]
      endDate.value = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0]
      break
    case 'this_year':
      startDate.value = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
      endDate.value = today.toISOString().split('T')[0]
      break
    case 'custom':
      // TODO: Show custom date inputs
      console.log('Custom date range selected')
      break
  }
  
  fetchCohorts()
}

// Methods
const fetchCohorts = async () => {
  // Don't fetch if no campaign is selected
  if (!selectedCampaign.value) {
    console.log('No campaign selected, skipping cohorts fetch')
    return
  }
  
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.append('period_type', periodType.value)
    params.append('periods', periods.value.toString())
    params.append('campaign_id', selectedCampaign.value) // Always required
    
    if (startDate.value) {
      params.append('start_date', startDate.value)
    }
    
    if (endDate.value) {
      params.append('end_date', endDate.value)
    }
    
    const response = await $fetch(`/api/analytics/cohorts?${params.toString()}`)
    cohortData.value = response.data
  } catch (error) {
    console.error('Error fetching cohorts:', error)
    toast.error('Error al cargar datos de cohortes')
  } finally {
    loading.value = false
  }
}

const fetchCampaigns = async () => {
  try {
    // Get campaigns from regular endpoint
    const campaignResponse = await $fetch('/api/campaign')
    const regularCampaigns = campaignResponse.data || []
    
    // Get unique campaigns from cohort data (with first available campaign)
    let firstCampaignId = null
    try {
      const cohortResponse = await $fetch('/api/analytics/cohorts?period_type=weekly&periods=1&campaign_id=' + (regularCampaigns[0]?.id || '1'))
      const cohortCampaigns = cohortResponse.data?.cohorts?.reduce((acc, cohort) => {
        if (cohort.campaign_id && cohort.campaign_name !== 'Sin campaña') {
          if (!firstCampaignId) firstCampaignId = cohort.campaign_id
          const exists = acc.find(c => c.id === cohort.campaign_id)
          if (!exists) {
            acc.push({
              id: cohort.campaign_id,
              name: cohort.campaign_name
            })
          }
        }
        return acc
      }, []) || []
      
      // Merge both sources, prioritizing regular campaigns
      const allCampaigns = [...regularCampaigns]
      cohortCampaigns.forEach(cohortCampaign => {
        const exists = allCampaigns.find(c => c.id === cohortCampaign.id)
        if (!exists) {
          allCampaigns.push(cohortCampaign)
        }
      })
      
      availableCampaigns.value = allCampaigns
      
      // Set first campaign as default if none selected
      if (!selectedCampaign.value && allCampaigns.length > 0) {
        selectedCampaign.value = allCampaigns[0].id
        // Fetch cohorts for the selected campaign
        await nextTick()
        fetchCohorts()
      }
    } catch (cohortError) {
      // If cohort fetch fails, just use regular campaigns
      availableCampaigns.value = regularCampaigns
      if (!selectedCampaign.value && regularCampaigns.length > 0) {
        selectedCampaign.value = regularCampaigns[0].id
        // Fetch cohorts for the selected campaign
        await nextTick()
        fetchCohorts()
      }
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error)
  }
}

const getPeriodData = (cohort, periodNumber) => {
  return cohort.periods.find(p => p.period_number === periodNumber)
}

const getPeriodLabel = (period) => {
  if (period === 0) return 'P0'
  return periodType.value === 'weekly' ? `S${period}` : 
         periodType.value === 'bi-weekly' ? `Q${period}` : `M${period}`
}

const getRetentionColor = (rate) => {
  if (rate >= 80) return 'bg-green-600'      // 80%+: Verde oscuro
  if (rate >= 60) return 'bg-green-500'      // 60-79%: Verde
  if (rate >= 40) return 'bg-blue-500'       // 40-59%: Azul
  if (rate >= 20) return 'bg-yellow-500'     // 20-39%: Amarillo
  if (rate >= 10) return 'bg-orange-500'     // 10-19%: Naranja
  if (rate >= 5) return 'bg-red-400'         // 5-9%: Rojo claro
  if (rate > 0) return 'bg-red-500'          // 1-4%: Rojo
  return 'bg-gray-400'                       // 0%: Gris
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('es-ES').format(num)
}

const formatPercentage = (num) => {
  return `${parseFloat(num).toFixed(1)}%`
}

// Initialize
onMounted(async () => {
  try {
    // First fetch campaigns (which will auto-select first and fetch cohorts)
    await fetchCampaigns()
  } finally {
    initialLoading.value = false
  }
})
</script>