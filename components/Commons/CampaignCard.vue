<template>
  <div 
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
    @click="$emit('click', campaign)"
  >
    <!-- Campaign Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
        {{ campaign.name }}
      </h3>
      <CampaignStatus :status="campaign.status" />
    </div>

    <!-- Templates Status -->
    <div v-if="showTemplates" class="space-y-3 mb-4">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600 dark:text-gray-400 flex items-center">
          Template Email
        </span>
        <StatusIndicator :active="hasEmailTemplate" />
      </div>
      
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600 dark:text-gray-400 flex items-center">
          Template Landing
        </span>
        <StatusIndicator :active="hasLandingTemplate" />
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
      <div class="text-center">
        <div class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ campaign.total_leads || 0 }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Leads</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ campaign.total_sends || 0 }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Envíos</div>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="showActions" class="mt-4 flex space-x-2">
      <UiButton 
        size="sm" 
        variant="outline" 
        @click.stop="$emit('configure', campaign)"
        class="flex-1"
      >
        Configurar
      </UiButton>
      <UiButton 
        size="sm" 
        @click.stop="$emit('preview', campaign)"
        class="flex-1"
      >
        Vista previa
      </UiButton>
    </div>

    <!-- Creation date -->
    <div v-if="showDate" class="mt-3 text-xs text-gray-400 text-center">
      Creada: {{ formatDate(campaign.created_at) }}
    </div>
  </div>
</template>

<script setup>
import CampaignStatus from './CampaignStatus.vue';
import StatusIndicator from './StatusIndicator.vue';

const props = defineProps({
  campaign: {
    type: Object,
    required: true
  },
  showTemplates: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showDate: {
    type: Boolean,
    default: true
  },
  hasEmailTemplate: {
    type: Boolean,
    default: true
  },
  hasLandingTemplate: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['click', 'configure', 'preview']);

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>