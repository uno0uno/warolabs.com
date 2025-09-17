<template>
  <div class="campaign-detail dashboard-page">
    <TheLoadingOverlay :show="loading" />

    <div v-if="loading" class="min-h-screen"></div>

    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-500 text-lg">{{ error }}</div>
      <UiButton @click="loadCampaignData" class="mt-4">Reintentar</UiButton>
    </div>

    <div v-else class="space-y-6">
      <!-- Campaign Header -->
      <div class="bg-white dark:bg-gray-800  shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ campaignData?.campaignName }}</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">ID: {{ $route.params.id }}</p>
          </div>
          <div class="flex items-center space-x-3">
            <span :class="[
              'px-3 py-1 rounded-full text-sm font-medium',
              campaignData?.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                campaignData?.status === 'active' ? 'bg-green-100 text-green-800' :
                  campaignData?.status === 'paused' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
            ]">
              {{ getStatusText(campaignData?.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Templates Validation -->
      <div class="bg-white dark:bg-gray-800  shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Estado de Templates</h2>
          <div :class="[
            'flex items-center space-x-2 px-3 py-2  text-sm font-medium',
            validation?.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          ]">
            <svg v-if="validation?.isValid" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span>{{ validation?.isValid ? 'Válido' : 'Incompleto' }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Email Template -->
          <div class="border border-gray-200 dark:border-gray-600  p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-medium flex items-center">
                <span class="mr-2">📧</span>
                Template Email
              </h3>
              <div :class="[
                'w-3 h-3 rounded-full',
                validation?.hasEmailTemplate ? 'bg-green-500' : 'bg-red-500'
              ]"></div>
            </div>

            <div v-if="validation?.hasEmailTemplate && templates?.email?.length > 0" class="space-y-2">
              <div v-for="template in templates.email" :key="template.id"
                class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <div class="font-medium text-sm">{{ template.name }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Versión {{ template.version_number }}
                </div>
                <div class="mt-2 flex space-x-2">
                  <UiButton size="sm" variant="outline" @click="editTemplate('email', template)">
                    Editar
                  </UiButton>
                  <UiButton size="sm" variant="outline" @click="previewTemplate('email', template)">
                    Vista previa
                  </UiButton>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-6 text-gray-500">
              <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6">
                </path>
              </svg>
              <p class="text-sm">Template Email requerido</p>
              <UiButton size="sm" class="mt-2" @click="createTemplate('email')">
                Crear Template Email
              </UiButton>
            </div>
          </div>

          <!-- Landing Template -->
          <div class="border border-gray-200 dark:border-gray-600  p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-medium flex items-center">
                <span class="mr-2">🎨</span>
                Template Landing
              </h3>
              <div :class="[
                'w-3 h-3 rounded-full',
                validation?.hasLandingTemplate ? 'bg-green-500' : 'bg-red-500'
              ]"></div>
            </div>

            <div v-if="validation?.hasLandingTemplate && templates?.landing?.length > 0" class="space-y-2">
              <div v-for="template in templates.landing" :key="template.id"
                class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <div class="font-medium text-sm">{{ template.name }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Versión {{ template.version_number }}
                </div>
                <div class="mt-2 flex space-x-2">
                  <UiButton size="sm" variant="outline" @click="editTemplate('landing', template)">
                    Editar
                  </UiButton>
                  <UiButton size="sm" variant="outline" @click="previewTemplate('landing', template)">
                    Vista previa
                  </UiButton>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-6 text-gray-500">
              <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6">
                </path>
              </svg>
              <p class="text-sm">Template Landing requerido</p>
              <UiButton size="sm" class="mt-2" @click="createTemplate('landing')">
                Crear Template Landing
              </UiButton>
            </div>
          </div>
        </div>

        <!-- Missing Templates Alert -->
        <div v-if="validation?.missingTemplates?.length > 0"
          class="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <div class="flex">
            <svg class="flex-shrink-0 h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.349 16c-.77.833.192 2.5 1.732 2.5z">
              </path>
            </svg>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">Templates requeridos faltantes</h3>
              <p class="mt-1 text-sm text-yellow-700">
                Para continuar con la campaña necesitas crear los siguientes templates:
                <strong>{{ validation.missingTemplates.join(', ') }}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Campaign Actions -->
      <div class="bg-white dark:bg-gray-800  shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Acciones</h2>
        <div class="flex space-x-3">
          <UiButton :disabled="!validation?.isValid" @click="activateCampaign"
            class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400">
            {{ campaignData?.status === 'active' ? 'Campaña Activa' : 'Activar Campaña' }}
          </UiButton>

          <UiButton variant="outline" @click="previewCampaign" :disabled="!validation?.isValid">
            Vista Previa Completa
          </UiButton>

          <UiButton variant="outline" @click="duplicateCampaign">
            Duplicar Campaña
          </UiButton>

          <UiButton variant="destructive" @click="deleteCampaign">
            Eliminar Campaña
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import TheLoadingOverlay from '@/components/Commons/TheLoadingOverlay.vue';

definePageMeta({
  layout: 'marketing'
});

const loading = ref(true);
const error = ref(null);
const campaignData = ref(null);
const validation = ref(null);
const templates = ref(null);

const getStatusText = (status) => {
  const statusMap = {
    'draft': 'Borrador',
    'active': 'Activa',
    'paused': 'Pausada',
    'completed': 'Completada'
  };
  return statusMap[status] || status;
};

const loadCampaignData = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await $fetch(`/api/campaign/validate-templates?campaignId=${$route.params.id}`);

    if (response.success) {
      campaignData.value = response.data;
      validation.value = response.data.validation;
      templates.value = response.data.templates;
    }
  } catch (err) {
    console.error('Error loading campaign data:', err);
    error.value = 'Error al cargar los datos de la campaña';
  } finally {
    loading.value = false;
  }
};

const editTemplate = (type, template) => {
  navigateTo(`/marketing/templates/${template.id}/edit`);
};

const previewTemplate = (type, template) => {
  navigateTo(`/marketing/templates/${template.id}/preview`);
};

const createTemplate = (type) => {
  navigateTo(`/marketing/templates/create?type=${type}&campaignId=${$route.params.id}`);
};

const activateCampaign = async () => {
  try {
    const response = await $fetch(`/api/campaign/${$route.params.id}/activate`, {
      method: 'POST'
    });

    if (response.success) {
      await loadCampaignData();
    }
  } catch (err) {
    console.error('Error activating campaign:', err);
    alert('Error al activar la campaña');
  }
};

const previewCampaign = () => {
  window.open(`/preview/campaign/${$route.params.id}`, '_blank');
};

const duplicateCampaign = async () => {
  try {
    const response = await $fetch(`/api/campaign/${$route.params.id}/duplicate`, {
      method: 'POST'
    });

    if (response.success) {
      navigateTo(`/marketing/campaigns/${response.data.id}`);
    }
  } catch (err) {
    console.error('Error duplicating campaign:', err);
    alert('Error al duplicar la campaña');
  }
};

const deleteCampaign = async () => {
  if (confirm('¿Estás seguro de que quieres eliminar esta campaña? Esta acción no se puede deshacer.')) {
    try {
      await $fetch(`/api/campaign/${$route.params.id}`, {
        method: 'DELETE'
      });

      navigateTo('/marketing/campaigns');
    } catch (err) {
      console.error('Error deleting campaign:', err);
      alert('Error al eliminar la campaña');
    }
  }
};

onMounted(() => {
  loadCampaignData();
});
</script>

<style scoped>
.campaign-detail {
  min-height: 100vh;
  padding: 2rem;
}

@media (max-width: 768px) {
  .campaign-detail {
    padding: 1rem;
  }
}
</style>