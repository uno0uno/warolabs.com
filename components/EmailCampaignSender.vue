<template>
  <CommonsTheLoadingOverlay :show="loadingCampaigns"/>
  <div v-if="!loadingCampaigns" class="space-y-6">
    <UiCard v-if="campaignsWithTemplates.length > 0">
      <UiCardHeader>
        <UiCardTitle style="font-family: 'Lato', sans-serif;">Seleccionar Campaña</UiCardTitle>
      </UiCardHeader>
      <UiCardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col h-full">
            <label class="block text-base font-medium mb-2" style="font-family: 'Lato', sans-serif;">Campaña</label>
            <select
              v-model="selectedCampaign"
              class="w-full p-3 border border-border rounded-md bg-background"
              @change="loadCampaignData"
            >
              <option value="">Selecciona una campaña...</option>
              <option v-for="campaign in campaignsWithTemplates" :key="campaign.id" :value="campaign.id">
                {{ campaign.name }}
              </option>
            </select>
          </div>
          <div class="flex flex-col h-full">
            <label class="block text-base font-medium mb-2" style="font-family: 'Lato', sans-serif;">Template</label>
            <div
              v-if="selectedTemplate && selectedTemplateData"
              class="w-full p-3 border border-border rounded-md bg-background flex items-center"
            >
              <Icon name="heroicons:document-text" class="w-4 h-4 mr-2 text-primary" />
              {{ selectedTemplateData.name }}
            </div>
            <div
              v-else
              class="w-full h-12 p-3 border border-border rounded-md bg-muted text-muted-foreground flex items-center"
            >
              {{ selectedCampaign ? 'No hay template disponible' : 'Selecciona una campaña primero' }}
            </div>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <CommonsEmptyState 
      v-if="campaignsWithTemplates.length === 0 && !loadingCampaigns"
      icon-name="heroicons:inbox"
      title="No hay campañas disponibles"
      description="No se encontraron campañas con templates de envío masivo"
    />

    <UiCard v-if="selectedCampaign && campaignsWithTemplates.length > 0">
      <UiCardHeader>
        <UiCardTitle>Configuración del Envío</UiCardTitle>
      </UiCardHeader>
      <UiCardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-base font-medium mb-2">Asunto</label>
            <UiInput v-model="emailSubject" placeholder="Asunto del email..." class="h-10 w-full" />
          </div>
          <div>
            <label class="block text-base font-medium mb-2">Remitente</label>
            <UiInput v-model="emailSender" placeholder="nombre@warolabs.com" class="h-10 w-full" />
          </div>
        </div>
        
        <div v-if="selectedTemplate">
          <label class="block text-base font-medium mb-2">Contenido (Vista Previa)</label>
          <div class="border border-border rounded-md p-4 bg-muted/30 max-h-48 overflow-y-auto">
            <div
              v-if="selectedTemplateData"
              v-html="selectedTemplateData.content"
              class="prose prose-sm max-w-none"
            ></div>
            <div v-else class="text-muted-foreground italic">
              Selecciona un template para ver la vista previa
            </div>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <UiCard v-if="selectedCampaign && campaignsWithTemplates.length > 0">
      <UiCardHeader>
        <UiCardTitle style="font-family: 'Lato', sans-serif;">Resumen y Envío</UiCardTitle>
      </UiCardHeader>
      <UiCardContent class="space-y-4">
        <div class="bg-muted/50 rounded-md p-4 space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <div class="text-base text-muted-foreground">Leads Totales:</div>
            <div class="font-medium text-right">{{ leads.length }}</div>
            <div class="text-base text-muted-foreground">Leads Verificados:</div>
            <div class="font-medium text-right">{{ verifiedLeadsCount }}</div>

            <div class="text-base text-muted-foreground mt-4 border-t border-border pt-2">Campaña:</div>
            <div class="font-medium text-right mt-4 border-t border-border pt-2">{{ selectedCampaignData?.name || 'No seleccionada' }}</div>
            <div class="text-base text-muted-foreground">Template:</div>
            <div class="font-medium text-right">{{ selectedTemplateData?.name || 'No seleccionado' }}</div>
            <div class="text-base text-muted-foreground">Asunto:</div>
            <div class="font-medium text-right">{{ emailSubject || 'Sin asunto' }}</div>
          </div>
        </div>

        <div v-if="sendingProgress.isActive" class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-base font-medium">Enviando emails...</span>
            <span class="text-base text-muted-foreground">
              {{ sendingProgress.sent }} / {{ sendingProgress.total }}
            </span>
          </div>
          <div class="w-full bg-muted rounded-full h-2">
            <div
              class="bg-primary h-2 rounded-full transition-all duration-300"
              :style="{ width: `${(sendingProgress.sent / sendingProgress.total) * 100}%` }"
            ></div>
          </div>
          <div v-if="sendingProgress.errors.length > 0" class="text-base text-destructive">
            {{ sendingProgress.errors.length }} errores encontrados
          </div>
        </div>

        <div class="flex justify-end">
          <UiButton
            @click="sendCampaign"
            :disabled="!canSend || sendingProgress.isActive"
            class="px-8 h-10"
          >
            <svg v-if="sendingProgress.isActive" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {{ sendingProgress.isActive ? 'Enviando...' : 'Enviar Campaña' }}
          </UiButton>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCampaignStore } from '~/store/useCampaignStore';
import { useCampaigns } from '~/composables/useCampaigns'; // Asegúrate que la ruta sea correcta

const router = useRouter();
const campaignStore = useCampaignStore();
const { success: toastSuccess, error: toastError, info: toastInfo, loading: toastLoading } = useToast();

const campaignsWithTemplates = ref([]);
const loadingCampaigns = ref(false);
const leads = ref([]);

const selectedCampaign = ref(campaignStore.selectedCampaignId || '');
const selectedTemplate = ref('');

const emailSubject = ref('');
const emailSender = ref('noreply@warolabs.com');


const sendingProgress = ref({
  isActive: false,
  sent: 0,
  total: 0,
  errors: []
});

const selectedCampaignData = computed(() => {
  return campaignsWithTemplates.value.find(c => c.id === selectedCampaign.value);
});

const templates = computed(() => {
  return selectedCampaignData.value?.templates || [];
});

const selectedTemplateData = computed(() => {
  const template = templates.value.find(t => t.id === selectedTemplate.value);
  if (!template) return null;
  
  return {
    ...template,
    content: template.active_version?.content || '<p>Contenido no disponible</p>',
    name: template.name
  };
});

const verifiedLeadsCount = computed(() => {
  return leads.value.filter(lead => lead.is_active).length;
});

const canSend = computed(() => {
  return selectedCampaign.value && 
         selectedTemplate.value && 
         leads.value.length > 0 && 
         emailSubject.value.trim();
});

const loadCampaignsWithTemplates = async () => {
  try {
    loadingCampaigns.value = true;
    const response = await $fetch('/api/campaign/with-templates');
    campaignsWithTemplates.value = response.data || [];
    
    if (campaignsWithTemplates.value.length === 0) {
      toastInfo('No hay campañas disponibles');
    }
  } catch (error) {
    console.error('Error loading campaigns with templates:', error);
    campaignsWithTemplates.value = [];
    toastError('Error al cargar campañas');
  } finally {
    loadingCampaigns.value = false;
  }
};

const loadCampaignLeads = async () => {
  if (!selectedCampaign.value) {
    leads.value = [];
    return;
  }
  
  try {
    const response = await $fetch('/api/leads', {
      query: {
        campaign_id: selectedCampaign.value,
        page: 1,
        limit: 1000
      }
    });
    leads.value = response.data || [];
  } catch (error) {
    console.error('Error loading campaign leads:', error);
    leads.value = [];
  }
};

const loadCampaignData = async () => {
  if (!selectedCampaign.value) {
    leads.value = [];
    selectedTemplate.value = '';
    campaignStore.clearSelectedCampaign();
    return;
  }
  
  try {
    const campaign = selectedCampaignData.value;
    if (campaign) {
      emailSubject.value = campaign.default_subject || '';
      campaignStore.setSelectedCampaign(selectedCampaign.value, campaign);
      
      // Auto-select the first template if available
      if (campaign.templates && campaign.templates.length > 0) {
        selectedTemplate.value = campaign.templates[0].id;
      } else {
        selectedTemplate.value = '';
      }
    }
    
    await loadCampaignLeads();

  } catch (error) {
    console.error('Error loading campaign data:', error);
  }
};


const sendCampaign = async () => {
  if (!canSend.value) return;

  try {
    sendingProgress.value = {
      isActive: true,
      sent: 0,
      total: leads.value.length,
      errors: []
    };

    toastLoading('Enviando campaña...');

    const response = await $fetch('/api/campaign/send', {
      method: 'POST',
      body: {
        campaignId: selectedCampaign.value,
        templateId: selectedTemplate.value,
        subject: emailSubject.value,
        sender: emailSender.value
      }
    });

    if (response.success) {
      sendingProgress.value.sent = leads.value.length;
      toastSuccess('Campaña enviada exitosamente');
      emailSubject.value = '';
    } else {
      throw new Error(response.message || 'Error al enviar la campaña');
    }

  } catch (error) {
    console.error('Error sending campaign:', error);
    sendingProgress.value.errors.push(error.message);
    toastError('Error al enviar la campaña');
  } finally {
    setTimeout(() => {
      sendingProgress.value.isActive = false;
    }, 2000);
  }
};

onMounted(async () => {
  await loadCampaignsWithTemplates();
  
  if (selectedCampaign.value) {
    await loadCampaignData();
  }
});
</script>