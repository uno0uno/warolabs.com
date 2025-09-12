<template>
  <CommonsTheLoadingOverlay :show="loadingCampaigns"/>
  <div v-if="!loadingCampaigns" class="space-y-6">
    <UiCard>
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
              <option v-for="campaign in campaigns" :key="campaign.id" :value="campaign.id">
                {{ campaign.name }}
              </option>
            </select>
          </div>
          <div class="flex flex-col h-full">
            <label class="block text-base font-medium mb-2" style="font-family: 'Lato', sans-serif;">Template</label>
            <select
              v-if="templates.length > 0"
              v-model="selectedTemplate"
              class="w-full p-3 border border-border rounded-md bg-background flex"
              :disabled="!selectedCampaign"
            >
              <option value="">Selecciona un template...</option>
              <option v-for="template in templates" :key="template.id" :value="template.id">
                {{ template.name }}
              </option>
            </select>
            <UiButton
              v-else-if="selectedCampaign"
              variant="outline"
              class="w-full px-3 justify-start flex h-full"
              @click="createTemplate"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Crear Template
            </UiButton>
            <div
              v-else
              class="w-full h-12 p-3 border border-border rounded-md bg-muted text-muted-foreground flex items-center"
            >
              Selecciona una campaña primero
            </div>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <UiCard v-if="selectedCampaign">
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

    <UiCard v-if="selectedCampaign">
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

const { campaigns, loading: loadingCampaigns, loadCampaigns } = useCampaigns();

const templates = ref([]);
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
  return campaigns.value.find(c => c.id === selectedCampaign.value);
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

const loadTemplates = async () => {
  if (!selectedCampaign.value) {
    templates.value = [];
    return;
  }
  try {
    const response = await $fetch('/api/templates', { 
      query: { campaign_id: selectedCampaign.value }
    });
    templates.value = response.data || [];
  } catch (error) {
    console.error('Error loading templates:', error);
    templates.value = [];
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
    templates.value = [];
    leads.value = [];
    campaignStore.clearSelectedCampaign();
    return;
  }
  
  try {
    const campaign = selectedCampaignData.value;
    if (campaign) {
      emailSubject.value = campaign.default_subject || '';
      campaignStore.setSelectedCampaign(selectedCampaign.value, campaign);
    }
    
    await Promise.all([
      loadTemplates(),
      loadCampaignLeads()
    ]);

  } catch (error)
 {
    console.error('Error loading campaign data:', error);
  }
};

const createTemplate = () => {
  if (!selectedCampaign.value) return;
  
  const campaign = selectedCampaignData.value;
  campaignStore.setSelectedCampaign(selectedCampaign.value, campaign);
  
  router.push('/dashboard/campaigns/templates');
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
      alert(`Campaña enviada exitosamente a ${leads.value.length} destinatarios.`);
      emailSubject.value = '';
    } else {
      throw new Error(response.message || 'Error al enviar la campaña');
    }

  } catch (error) {
    console.error('Error sending campaign:', error);
    sendingProgress.value.errors.push(error.message);
  } finally {
    setTimeout(() => {
      sendingProgress.value.isActive = false;
    }, 2000);
  }
};

onMounted(async () => {
  await loadCampaigns();
  
  if (selectedCampaign.value) {
    await loadCampaignData();
  }
});
</script>