<script setup>
import { computed } from 'vue';
import { useCampaignStore } from '@/store/useCampaignStore';
import { useToast } from '@/composables/useToast';
import { useRouter } from 'vue-router';
import StatCard from '@/components/Commons/StatCard.vue';
import CampaignCard from '@/components/Commons/CampaignCard.vue';
import CampaignsTable from '@/components/CampaignsTable.vue';
import CreateCampaignModal from '@/components/CreateCampaignModal.vue';
import ConfirmDeleteCampaignModal from '@/components/Commons/ConfirmDeleteCampaignModal.vue';
import CampaignDataWarningModal from '@/components/Commons/CampaignDataWarningModal.vue';

const showNewCampaignModal = ref(false);
const showEditCampaignModal = ref(false);
const selectedCampaign = ref(null);
const showDeleteModal = ref(false);
const campaignToDelete = ref(null);
const isDeletingCampaign = ref(false);
const showDataWarningModal = ref(false);
const campaignDataWarning = ref(null);
const store = useCampaignStore();
const toast = useToast();
const router = useRouter();

// Navigation function
const goBackToTemplates = () => {
  router.push('/marketing/templates');
};

const { data: campaigns, pending: loading, refresh } = useFetch('/api/campaign', {
  transform: (response) => response.success ? response.data : [],
  default: () => []
});

const stats = computed(() => {
  return {
    totalCampaigns: campaigns.value.length,
    activeCampaigns: campaigns.value.filter(c => c.status === 'active').length,
    totalLeads: campaigns.value.reduce((sum, c) => sum + (c.total_leads || 0), 0),
    totalSends: campaigns.value.reduce((sum, c) => sum + (c.total_sends || 0), 0)
  };
});

const deleteCampaignInfo = computed(() => {
  if (!campaignToDelete.value) return { name: '', status: '', totalLeads: 0, createdAt: '' };
  
  return {
    name: campaignToDelete.value.name,
    status: campaignToDelete.value.status,
    totalLeads: campaignToDelete.value.total_leads || 0,
    createdAt: campaignToDelete.value.created_at
  };
});

const navigateToCampaign = (campaign) => {
  navigateTo(`/marketing/campaigns/${campaign.id}`);
};

const editCampaign = (campaign) => {
  selectedCampaign.value = campaign;
  showEditCampaignModal.value = true;
};

const handleCampaignCreated = async (campaignData) => {
  console.log('📊 Nueva campaña creada:', campaignData);
  console.log('🔄 Cerrando modal de creación...');
  showNewCampaignModal.value = false;
  // Recargar las campañas
  await refresh();
};

const handleCampaignUpdated = async (campaignData) => {
  console.log('📊 handleCampaignUpdated ejecutado con:', campaignData);
  console.log('🔄 showEditCampaignModal antes:', showEditCampaignModal.value);
  showEditCampaignModal.value = false;
  selectedCampaign.value = null;
  console.log('🔄 showEditCampaignModal después:', showEditCampaignModal.value);
  // Recargar las campañas
  await refresh();
};

const deleteCampaign = (campaign) => {
  campaignToDelete.value = campaign;
  showDeleteModal.value = true;
};

const confirmDeleteCampaign = async () => {
  if (!campaignToDelete.value) return;

  isDeletingCampaign.value = true;

  try {
    const response = await $fetch(`/api/campaign/${campaignToDelete.value.id}`, {
      method: 'DELETE'
    });

    if (response.success) {
      // Mostrar toast de éxito
      toast.success('Campaña eliminada exitosamente');
      // Recargar las campañas
      await refresh();
      // Cerrar modal
      showDeleteModal.value = false;
      campaignToDelete.value = null;
    }
  } catch (error) {
    console.error('Error al eliminar campaña:', error);
    
    // Verificar si el error es porque la campaña tiene datos
    if (error.data?.reason === 'CAMPAIGN_HAS_DATA') {
      // Cerrar modal de eliminación
      showDeleteModal.value = false;
      
      // Mostrar modal de advertencia con datos específicos
      campaignDataWarning.value = {
        name: campaignToDelete.value.name,
        data: error.data.details
      };
      showDataWarningModal.value = true;
    } else {
      // Error genérico
      toast.error('Error al eliminar la campaña');
    }
  } finally {
    isDeletingCampaign.value = false;
  }
};

const cancelDeleteCampaign = () => {
  showDeleteModal.value = false;
  campaignToDelete.value = null;
};

const closeDataWarningModal = () => {
  showDataWarningModal.value = false;
  campaignDataWarning.value = null;
  campaignToDelete.value = null;
};

const pauseCampaignFromWarning = async () => {
  if (!campaignToDelete.value) return;

  try {
    // Actualizar campaña a estado 'paused'
    const response = await $fetch(`/api/campaign/${campaignToDelete.value.id}`, {
      method: 'PUT',
      body: {
        campaign_name: campaignToDelete.value.name,
        profile_id: campaignToDelete.value.profile_id,
        status: 'paused'
      }
    });

    if (response.success) {
      // Recargar las campañas
      await refresh();
      closeDataWarningModal();
    }
  } catch (error) {
    console.error('Error al pausar campaña:', error);
  }
};

</script>


<template>
  <div class="campaigns-dashboard dashboard-page">

    <div v-if="loading" class="min-h-screen"></div>

    <div v-else class="space-y-8">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard :value="stats.totalCampaigns" label="Campañas Totales" color="blue" />
        <StatCard :value="stats.activeCampaigns" label="Campañas Activas" color="green" />
        <StatCard :value="stats.totalLeads" label="Leads Generados" color="purple" />
        <StatCard :value="stats.totalSends" label="Emails Enviados" color="orange" />
      </div>

      <!-- Recent Campaigns -->
      <div class="card-base p-6">

        <CampaignsTable 
          :campaigns="campaigns" 
          :deleting-campaign="campaignToDelete?.id"
          @create="showNewCampaignModal = true" 
          @edit="editCampaign"
          @view="navigateToCampaign"
          @delete="deleteCampaign"
        />
      </div>

    </div>

    <!-- Create Campaign Modal -->
    <CreateCampaignModal 
      :show="showNewCampaignModal" 
      @close="showNewCampaignModal = false"
      @created="handleCampaignCreated"
    />
    
    <!-- Edit Campaign Modal -->
    <CreateCampaignModal 
      :show="showEditCampaignModal" 
      :campaign="selectedCampaign"
      @close="showEditCampaignModal = false; selectedCampaign = null"
      @updated="handleCampaignUpdated"
    />

    <!-- Delete Campaign Modal -->
    <ConfirmDeleteCampaignModal
      :show="showDeleteModal"
      :campaign-info="deleteCampaignInfo"
      :loading="isDeletingCampaign"
      @confirm="confirmDeleteCampaign"
      @cancel="cancelDeleteCampaign"
    />

    <!-- Campaign Data Warning Modal -->
    <CampaignDataWarningModal
      :show="showDataWarningModal"
      :campaign-name="campaignDataWarning?.name || ''"
      :data="campaignDataWarning?.data || {}"
      @close="closeDataWarningModal"
      @pause-campaign="pauseCampaignFromWarning"
    />
  </div>
</template>
