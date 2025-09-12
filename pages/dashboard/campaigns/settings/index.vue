
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCampaignStore } from '@/store/useCampaignStore';
import TheLoadingOverlay from '@/components/Commons/TheLoadingOverlay.vue';
import StatCard from '@/components/Commons/StatCard.vue';
import CampaignCard from '@/components/Commons/CampaignCard.vue';
import CampaignsTable from '@/components/CampaignsTable.vue';

const loading = ref(true);
const campaigns = ref([]);
const showNewCampaignModal = ref(false);
const store = useCampaignStore();

const stats = computed(() => {
  return {
    totalCampaigns: campaigns.value.length,
    activeCampaigns: campaigns.value.filter(c => c.status === 'active').length,
    totalLeads: campaigns.value.reduce((sum, c) => sum + (c.total_leads || 0), 0),
    totalSends: campaigns.value.reduce((sum, c) => sum + (c.total_sends || 0), 0)
  };
});

const navigateToCampaign = (campaign) => {
  navigateTo(`/dashboard/campaigns/settings/${campaign.id}`);
};

const editCampaign = (campaign) => {
  navigateTo(`/dashboard/campaigns/settings/${campaign.id}/edit`);
};

const loadCampaigns = async () => {
  try {
    loading.value = true;
    console.log('🔄 Loading campaigns...');
    const response = await $fetch('/api/campaign');
    console.log('📊 Campaigns response:', response);
    
    if (response.success) {
      campaigns.value = response.data;
      console.log('✅ Campaigns loaded:', campaigns.value.length);
    } else {
      console.error('❌ Failed to load campaigns:', response);
      campaigns.value = [];
    }
  } catch (error) {
    console.error('❌ Error loading campaigns:', error);
    campaigns.value = [];
  } finally {
    console.log('🏁 Setting loading to false');
    loading.value = false;
  }
};

onMounted(() => {
  loadCampaigns();
});
</script>

<style scoped>
.bg-background-light {
  background-color: #f8f9fa; /* Un color de fondo claro */
}
</style>

<template>
  <div class="campaigns-dashboard">
    <TheLoadingOverlay :show="loading" />

    <div v-if="loading" class="min-h-screen"></div>

    <div v-else class="space-y-8">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          :value="stats.totalCampaigns" 
          label="Campañas Totales" 
          color="blue" 
        />
        <StatCard 
          :value="stats.activeCampaigns" 
          label="Campañas Activas" 
          color="green" 
        />
        <StatCard 
          :value="stats.totalLeads" 
          label="Leads Generados" 
          color="purple" 
        />
        <StatCard 
          :value="stats.totalSends" 
          label="Emails Enviados" 
          color="orange" 
        />
      </div>

      <!-- Recent Campaigns -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">

        <CampaignsTable 
          :campaigns="campaigns.slice(0, 6)" 
          @create="showNewCampaignModal = true"
          @edit="editCampaign"
          @view="navigateToCampaign" 
        />
      </div>

    </div>
  </div>
</template>
