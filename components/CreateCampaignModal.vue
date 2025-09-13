<!-- components/CreateCampaignModal.vue -->
<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Transition
        enter-active-class="transition-all duration-300 ease-out delay-100"
        enter-from-class="opacity-0 transform scale-95 -translate-y-4"
        enter-to-class="opacity-100 transform scale-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 transform scale-100 translate-y-0"
        leave-to-class="opacity-0 transform scale-95 -translate-y-4"
      >
        <UiCard v-if="show" class="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-primary/20">
          <UiCardHeader>
            <div class="flex items-center justify-between">
              <div>
                <UiCardTitle class="flex items-center gap-2">
                  <MegaphoneIcon class="w-5 h-5 text-primary" />
                  {{ isEditing ? 'Editar Campaña' : 'Crear Nueva Campaña' }}
                </UiCardTitle>
                <p class="text-sm text-muted-foreground">{{ isEditing ? 'Modifica los detalles de la campaña.' : 'Define los detalles y asigna la campaña a un usuario y tenant.' }}</p>
              </div>
              <UiButton variant="ghost" size="sm" @click="closeModal" class="p-2">
                <XMarkIcon class="w-4 h-4" />
              </UiButton>
            </div>
          </UiCardHeader>

          <UiCardContent class="space-y-6">
            <div v-if="isLoading" class="flex items-center justify-center py-8">
              <div class="flex items-center gap-2 text-muted-foreground">
                <div class="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                Cargando datos...
              </div>
            </div>

            <div v-else class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <label for="tenant-select" class="block text-sm font-medium mb-2">Organización (Tenant)</label>
                  <select id="tenant-select" v-model="selectedTenantId" class="w-full p-2 border rounded-md bg-white dark:bg-gray-800">
                    <option :value="null" disabled>Seleccione un tenant</option>
                    <option v-for="tenant in tenants" :key="tenant.tenant_id" :value="tenant.tenant_id">
                      {{ tenant.tenant_name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label for="profile-select" class="block text-sm font-medium mb-2">Usuario (Profile)</label>
                  <select id="profile-select" v-model="form.profile_id" :disabled="!selectedTenantId || selectedTenantMembers.length === 0" class="w-full p-2 border rounded-md bg-white dark:bg-gray-800">
                    <option value="" disabled>Seleccione un usuario</option>
                    <option v-for="member in selectedTenantMembers" :key="member.profile_id" :value="member.profile_id">
                      {{ member.name }} ({{ member.email }})
                    </option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Nombre de la Campaña</label>
                  <UiInput v-model="form.campaign_name" placeholder="Ej: Lanzamiento Producto 2024" class="h-10 w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Slug de la Campaña</label>
                  <div class="h-10 w-full flex items-center px-3 bg-muted/60 rounded-md">
                    <p v-if="form.slug" class="text-sm font-mono text-muted-foreground">{{ form.slug }}</p>
                    <p v-else class="text-sm text-muted-foreground/80">Se generará automáticamente...</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Descripción (opcional)</label>
                  <UiTextarea v-model="form.campaign_description" placeholder="Breve descripción de la campaña" class="w-full resize-none" rows="2" />
                </div>
              </div>

              <div v-if="templatePairs && templatePairs.length > 0">
                <label class="block text-sm font-medium mb-3">Seleccionar Par de Templates</label>
                <div class="space-y-3 max-h-60 overflow-y-auto p-1">
                  <div
                    v-for="pair in templatePairs"
                    :key="pair.pair_id"
                    class="border rounded-lg p-4 cursor-pointer transition-all duration-200"
                    :class="form.pair_id === pair.pair_id 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-border hover:border-primary/50 hover:shadow-sm'"
                    @click="form.pair_id = pair.pair_id"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h4 class="font-medium text-sm mb-1">{{ pair.name }}</h4>
                        <p v-if="pair.description" class="text-xs text-muted-foreground mb-2">{{ pair.description }}</p>
                        <div class="flex gap-4 text-xs">
                          <div class="flex items-center gap-1"><EnvelopeIcon class="w-3 h-3" /><span>{{ pair.email_template.name }}</span></div>
                          <div class="flex items-center gap-1"><GlobeAltIcon class="w-3 h-3" /><span>{{ pair.landing_template.name }}</span></div>
                        </div>
                      </div>
                      <div class="ml-3">
                        <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                             :class="form.pair_id === pair.pair_id ? 'border-primary bg-primary' : 'border-muted-foreground'">
                          <div v-if="form.pair_id === pair.pair_id" class="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <DocumentDuplicateIcon class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 class="text-lg font-medium text-muted-foreground mb-2">No hay pares de templates</h3>
                <p class="text-muted-foreground mb-4">Necesitas crear al menos un par de templates para poder crear una campaña.</p>
                <UiButton @click="navigateTo('/dashboard/marketing/templates')" variant="outline">
                  Crear Templates
                </UiButton>
              </div>
            </div>
          </UiCardContent>

          <UiCardFooter class="flex gap-2 justify-end border-t bg-muted/20">
            <UiButton variant="outline" @click="closeModal">
              Cancelar
            </UiButton>
            <UiButton 
              @click="createCampaign" 
              :disabled="!canCreate || isCreatingCampaign"
              class="flex items-center gap-2"
            >
              <div v-if="isCreatingCampaign" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              {{ isCreatingCampaign ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Campaña') }}
            </UiButton>
          </UiCardFooter>
        </UiCard>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { 
  XMarkIcon, 
  MegaphoneIcon, 
  DocumentDuplicateIcon,
  EnvelopeIcon,
  GlobeAltIcon
} from '@heroicons/vue/24/outline';
import { useToast } from '~/composables/useToast';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  campaign: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'created', 'updated']);
const toast = useToast();

const form = ref({
  campaign_name: '',
  slug: '',
  campaign_description: '',
  pair_id: '',
  profile_id: '',
  tenant_id: ''
});

const isLoading = ref(false);
const isCreatingCampaign = ref(false);
const selectedTenantId = ref(null);
const tenants = ref([]);
const templatePairs = ref([]);


const isEditing = computed(() => !!props.campaign);

const selectedTenantMembers = computed(() => {
  if (!selectedTenantId.value || !tenants.value) return [];
  const selected = tenants.value.find(t => t.tenant_id === selectedTenantId.value);
  return selected ? selected.members : [];
});

const canCreate = computed(() => {
  return form.value.campaign_name.trim() &&
         form.value.slug.trim() &&
         form.value.pair_id &&
         form.value.profile_id &&
         form.value.tenant_id &&
         !isCreatingCampaign.value;
});

const loadInitialData = async () => {
  isLoading.value = true;
  try {
    const [tenantsResponse, pairsResponse] = await Promise.all([
      $fetch('/api/tenants/all'),
      $fetch('/api/templates/pairs')
    ]);

    if (tenantsResponse.success && Array.isArray(tenantsResponse.data)) {
      tenants.value = tenantsResponse.data.map(tenant => ({
        ...tenant,
        members: tenant.members || []
      }));
    }

    if (pairsResponse.success) {
      templatePairs.value = pairsResponse.data;
    }
  } catch (error) {
    console.error("Error loading initial data:", error);
    toast.error("Error al cargar los datos necesarios para crear la campaña.");
  } finally {
    isLoading.value = false;
  }
};

const handleUpdateCampaign = async () => {
  const response = await $fetch(`/api/campaign/${props.campaign.id}`, {
    method: 'PUT',
    body: form.value
  });
  toast.success('Campaña actualizada exitosamente');
  emit('updated', response.data);
  emit('close');
};

const handleCreateCampaign = async () => {
  const response = await $fetch('/api/campaign/create-with-pair', {
    method: 'POST',
    body: form.value
  });
  toast.success('Campaña creada exitosamente');
  emit('created', response.data);
  emit('close');
};

const createCampaign = async () => {
  if (!canCreate.value) return;
  
  isCreatingCampaign.value = true;
  
  try {
    if (isEditing.value) {
      await handleUpdateCampaign();
    } else {
      await handleCreateCampaign();
    }
  } catch (error) {
    console.error('Campaign operation failed:', error);
    toast.error(isEditing.value ? 'Error al actualizar la campaña' : 'Error al crear la campaña');
  }
  
  isCreatingCampaign.value = false;
};

const closeModal = () => {
  isCreatingCampaign.value = false; // Reset loading state
  emit('close');
  resetForm();
};

const resetForm = () => {
  form.value = {
    campaign_name: '',
    slug: '',
    campaign_description: '',
    pair_id: '',
    profile_id: '',
    tenant_id: ''
  };
  selectedTenantId.value = null;
};

const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const loadCampaignData = async () => {
  if (props.campaign) {
    // Obtener datos completos de la campaña
    try {
      const response = await $fetch(`/api/campaign/${props.campaign.id}`);
      if (response.success) {
        const campaignData = response.data;
        form.value = {
          campaign_name: campaignData.name || '',
          slug: campaignData.slug || '',
          campaign_description: campaignData.description || '',
          pair_id: campaignData.pair_id || '',
          profile_id: campaignData.profile_id || '',
          tenant_id: campaignData.tenant_id || ''
        };
        selectedTenantId.value = campaignData.tenant_id;
      }
    } catch (error) {
      console.error('Error loading campaign data:', error);
      // Fallback a los datos básicos si falla la consulta completa
      form.value = {
        campaign_name: props.campaign.name || '',
        slug: props.campaign.slug || '',
        campaign_description: props.campaign.description || '',
        pair_id: props.campaign.pair_id || '',
        profile_id: props.campaign.profile_id || '',
        tenant_id: props.campaign.tenant_id || ''
      };
      selectedTenantId.value = props.campaign.tenant_id;
    }
  }
};

watch(() => props.show, async (newValue) => {
  if (newValue) {
    await loadInitialData(); 
    if (isEditing.value) {
      await loadCampaignData();
    } else {
      resetForm();
    }
  }
});

watch(() => form.value.campaign_name, (newName) => {
  if (!isEditing.value) {
    form.value.slug = generateSlug(newName);
  }
});

watch(selectedTenantId, (newTenantId) => {
  form.value.tenant_id = newTenantId;
  form.value.profile_id = ''; 
  
  if (selectedTenantMembers.value.length > 0) {
      form.value.profile_id = selectedTenantMembers.value[0].profile_id;
  }
});

watch(isCreatingCampaign, (newValue) => {
  isLoading.value = newValue;
});

</script>