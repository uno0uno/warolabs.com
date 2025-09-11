import { defineStore } from 'pinia';

export const useCampaignStore = defineStore('campaignStore', {
  state: () => ({
    selectedCampaignId: null,
    selectedCampaignData: null,
    campaigns: []
  }),

  getters: {
    getSelectedCampaign: (state) => {
      return state.campaigns.find(c => c.id === state.selectedCampaignId) || state.selectedCampaignData;
    },
    
    hasSelectedCampaign: (state) => {
      return !!state.selectedCampaignId;
    }
  },

  actions: {
    setSelectedCampaign(campaignId, campaignData = null) {
      this.selectedCampaignId = campaignId;
      if (campaignData) {
        this.selectedCampaignData = campaignData;
      }
    },

    clearSelectedCampaign() {
      this.selectedCampaignId = null;
      this.selectedCampaignData = null;
    },

    setCampaigns(campaigns) {
      this.campaigns = campaigns;
    },

    updateCampaignData(campaignId, data) {
      const index = this.campaigns.findIndex(c => c.id === campaignId);
      if (index !== -1) {
        this.campaigns[index] = { ...this.campaigns[index], ...data };
      }
      
      if (this.selectedCampaignId === campaignId) {
        this.selectedCampaignData = { ...this.selectedCampaignData, ...data };
      }
    }
  }
});