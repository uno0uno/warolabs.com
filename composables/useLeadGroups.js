export const useLeadGroups = () => {
  const loading = ref(false)
  const error = ref(null)
  
  // Estado para grupos de leads
  const leadGroups = ref([])
  const leadMetrics = ref(null)
  const selectedGroup = ref(null)
  
  // Obtener lista de grupos
  const fetchLeadGroups = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await $fetch('/api/lead-groups')
      
      leadGroups.value = data || []
      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar grupos de leads'
      console.error('Error fetching lead groups:', err)
    } finally {
      loading.value = false
    }
  }
  
  
  // Crear nuevo grupo
  const createLeadGroup = async (groupData) => {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await $fetch('/api/lead-groups/create', {
        method: 'POST',
        body: groupData
      })
      
      return data
    } catch (err) {
      error.value = err.message || 'Error al crear grupo de leads'
      console.error('Error creating lead group:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener tipos de interacción disponibles
  const getAvailableInteractionTypes = () => {
    return [
      { value: 'lead_capture', label: 'Captura de Lead' },
      { value: 'email_open', label: 'Apertura de Email' },
      { value: 'email_click', label: 'Click en Email' },
      { value: 'email_sent', label: 'Email Enviado' },
      { value: 'conversion', label: 'Conversión' },
      { value: 'page_view', label: 'Vista de Página' },
      { value: 'form_interaction', label: 'Interacción con Formulario' }
    ]
  }

  // Helpers para crear filtros comunes
  const createCommonFilters = {
    coldLeads: () => ({
      only_interaction_type: 'lead_capture',
      recent_interaction_days: 30
    }),
    emailEngagers: () => ({
      has_interaction_type: 'email_open',
      min_opens: 1,
      recent_interaction_days: 14
    }),
    hotLeads: () => ({
      has_interaction_type: 'email_click',
      min_clicks: 2,
      min_opens: 3,
      recent_interaction_days: 7
    }),
    freshCaptures: () => ({
      only_interaction_type: 'lead_capture',
      recent_interaction_days: 7
    }),
    inactive: () => ({
      exclude_interaction_type: 'email_open',
      min_total_interactions: 1,
      // No recent interactions in 30+ days (handled by UI)
    }),
    converted: () => ({
      has_interaction_type: 'conversion',
      is_converted: true
    })
  }
  
  // Obtener journey de un lead específico
  const fetchLeadJourney = async (leadId) => {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await $fetch(`/api/lead-interactions/journey/${leadId}`)
      
      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar journey del lead'
      console.error('Error fetching lead journey:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Obtener analytics de interacciones
  const fetchInteractionAnalytics = async (groupBy = 'interaction_type', dateRange = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('group_by', groupBy)
      
      if (dateRange.start_date) queryParams.append('start_date', dateRange.start_date)
      if (dateRange.end_date) queryParams.append('end_date', dateRange.end_date)
      
      const url = `/api/lead-interactions/analytics?${queryParams.toString()}`
      
      const { data } = await $fetch(url)
      
      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar analytics'
      console.error('Error fetching interaction analytics:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    loading,
    error,
    leadGroups,
    leadMetrics,
    selectedGroup,
    fetchLeadGroups,
    createLeadGroup,
    fetchLeadJourney,
    fetchInteractionAnalytics,
    getAvailableInteractionTypes,
    createCommonFilters
  }
}