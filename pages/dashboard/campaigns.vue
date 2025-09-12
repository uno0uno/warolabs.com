<template>
  <div class="">
    <div class="sticky top-0 z-[5] bg-white dark:bg-gray-900 pb-4 border-b border-gray-200 dark:border-gray-700 shadow-sm p-6 px-12">
      <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
                <div>
                <h1 class="text-3xl font-extrabold font-principal">Campañas Marketing</h1>
                <p class="text-sm text-muted-foreground">Empieza aquí tu próxima campaña de email exitosa.</p>
                </div>
                <UiButton @click="showNewCampaignModal = true" class="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white h-10 px-4 py-2 text-sm font-medium">
                  <PlusIcon class="w-4 h-4" />
                  Nueva Campaña
                </UiButton>
            </div>

            <nav class="flex space-x-2">
              <NuxtLink 
                to="/dashboard/campaigns/settings"
                :class="['px-4 py-2 font-medium text-sm transition-colors duration-200 border-0 rounded-md', 
                        $route.path === '/dashboard/campaigns/settings' 
                            ? 'bg-black text-white shadow-md' 
                            : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800']"
                style="font-family: 'Lato', sans-serif;"
                >
                Campañas
                </NuxtLink>

                <NuxtLink 
                to="/dashboard/campaigns/templates"
                :class="['px-4 py-2 font-medium text-sm transition-colors duration-200 border-0 rounded-md', 
                        $route.path.includes('/templates') 
                            ? 'bg-black text-white shadow-md' 
                            : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800']"
                style="font-family: 'Lato', sans-serif;"
                >
                Templates
                </NuxtLink>
                

                
                <NuxtLink 
                to="/dashboard/campaigns/sender"
                :class="['px-4 py-2 font-medium text-sm transition-colors duration-200 border-0 rounded-md', 
                        $route.path.includes('/sender') 
                            ? 'bg-black text-white shadow-md' 
                            : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800']"
                style="font-family: 'Lato', sans-serif;"
                >
                Envío Masivo
                </NuxtLink>
                
                <NuxtLink 
                to="/dashboard/campaigns/analytics"
                :class="['px-4 py-2 font-medium text-sm transition-colors duration-200 border-0 rounded-md', 
                        $route.path.includes('/analytics') 
                            ? 'bg-black text-white shadow-md' 
                            : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800']"
                style="font-family: 'Lato', sans-serif;"
                >
                Analíticas
                </NuxtLink>
                
                <NuxtLink 
                to="/dashboard/campaigns/settings"
                :class="['px-4 py-2 font-medium text-sm transition-colors duration-200 border-0 rounded-md', 
                        $route.path.includes('/database') 
                            ? 'bg-black text-white shadow-md' 
                            : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800']"
                style="font-family: 'Lato', sans-serif;"
                >
                Base de Datos
                </NuxtLink>
            </nav>
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-400 ease-out"
      enter-from-class="opacity-0 transform translate-y-[-20px]"
      enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 transform translate-y-0"
      leave-to-class="opacity-0 transform translate-y-[-20px]"
      mode="out-in"
    >
      <NuxtPage />
    </Transition>

    <div v-if="showNewCampaignModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <UiCard class="w-full max-w-2xl mx-4">
        <UiCardHeader>
          <UiCardTitle>Nueva Campaña de Email</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Nombre de la Campaña</label>
            <UiInput v-model="newCampaign.name" placeholder="Ej: Newsletter Febrero 2024" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Descripción</label>
            <textarea 
              v-model="newCampaign.description" 
              class="w-full p-3 border border-border rounded-md bg-background"
              rows="3"
              placeholder="Describe el objetivo de esta campaña..."
            ></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <UiButton variant="outline" @click="showNewCampaignModal = false">
              Cancelar
            </UiButton>
            <UiButton @click="createCampaign" :disabled="!newCampaign.name">
              Crear Campaña
            </UiButton>
          </div>
        </UiCardContent>
      </UiCard>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCampaignStore } from '@/store/useCampaignStore';
import { PlusIcon } from '@heroicons/vue/24/outline';

definePageMeta({
  layout: 'dashboard'
});

const showNewCampaignModal = ref(false);
const newCampaign = ref({ name: '', description: '' });
const store = useCampaignStore();

const createCampaign = async () => {
  try {
    console.log('Creating campaign:', newCampaign.value);
    
    const response = await $fetch('/api/campaign/create-with-templates', {
      method: 'POST',
      body: {
        name: newCampaign.value.name,
        description: newCampaign.value.description
      }
    });
    
    if (response.success) {
      store.updateCampaignData(response.data.campaign.id, response.data.campaign);
      
      console.log('Campaign created with templates:', {
        campaign: response.data.campaign,
        emailTemplate: response.data.emailTemplate,
        landingTemplate: response.data.landingTemplate
      });
      
      newCampaign.value = { name: '', description: '' };
      showNewCampaignModal.value = false;
      
      await navigateTo(`/dashboard/campaigns/settings/${response.data.campaign.id}`);
    }
  } catch (error) {
    console.error('Error creating campaign:', error);
    alert('Error al crear la campaña. Por favor intenta de nuevo.');
  }
};
</script>