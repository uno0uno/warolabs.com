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

  const refresh = () => loadCampaigns()

  const createCampaignWithTemplates = async (campaignData) => {
    const { data } = await $fetch('/api/campaign/create-with-templates', {
      method: 'POST',
      body: campaignData
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

  // Auto load will be called manually from onMounted in components

  return {
    campaigns: readonly(campaigns),
    loading: readonly(loading),
    error: readonly(error),
    refresh,
    loadCampaigns,
    createCampaignWithTemplates,
    updateCampaign
  }
}