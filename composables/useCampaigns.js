import { ref, readonly } from 'vue'

export const useCampaigns = () => {
  const campaigns = ref([])
  const loading = ref(false)
  const error = ref(null)

  const loadCampaigns = async () => {
    try {
      loading.value = true
      const response = await $fetch('/api/campaign')
      campaigns.value = response?.data || []
    } catch (err) {
      console.error('Error loading campaigns:', err)
      error.value = err
      campaigns.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchCampaigns = () => loadCampaigns()
  const refresh = () => loadCampaigns()

  const createCampaign = async (campaignData) => {
    const { data } = await $fetch('/api/campaign', {
      method: 'POST',
      body: campaignData
    })
    
    await refresh()
    return data
  }

  const createCampaignWithTemplates = async (campaignData) => {
    const { data } = await $fetch('/api/campaign/create-with-templates', {
      method: 'POST',
      body: campaignData
    })
    
    await refresh()
    return data
  }

  const deleteCampaign = async (campaignId) => {
    const { data } = await $fetch(`/api/campaign/${campaignId}`, {
      method: 'DELETE'
    })
    
    await refresh()
    return data
  }

  const updateCampaign = async (campaignId, campaignData) => {

    const { data } = await $fetch(`/api/campaign/${campaignId}`, {
      method: 'PUT', 
      body: campaignData
    })
    
    await refresh()
    return data
  }

  const updateCampaignTemplates = async (campaignId, templateData) => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch(`/api/templates/pairs/${campaignId}`, {
        method: 'PUT',
        body: templateData,
      })
      // Refresca la lista de campañas para reflejar cualquier cambio.
      await refresh()
      return response
    } catch (e) {
      error.value = 'Error al actualizar las plantillas de la campaña.'
      console.error(e)
      // Propaga el error para que el componente pueda notificar al usuario.
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    campaigns: readonly(campaigns),
    loading: readonly(loading),
    error: readonly(error),
    refresh,
    fetchCampaigns,
    loadCampaigns,
    createCampaign,
    createCampaignWithTemplates,
    updateCampaign,
    deleteCampaign,
    updateCampaignTemplates, // <-- Nueva función exportada
  }
}