<template>
  <div 
    class="card-interactive p-6"
    @click="$emit('click', campaign)"
  >
    <!-- Campaign Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-foreground truncate">
        {{ campaign.name }}
      </h3>
      <CampaignStatus :status="campaign.status" />
    </div>

    <!-- Templates Status -->
    <div v-if="showTemplates" class="space-y-3 mb-4">
      <div class="flex items-center justify-between">
        <span class="text-sm text-muted-foreground flex items-center">
          Template Email
        </span>
        <StatusIndicator :active="hasEmailTemplate" />
      </div>
      
      <div class="flex items-center justify-between">
        <span class="text-sm text-muted-foreground flex items-center">
          Template Landing
        </span>
        <StatusIndicator :active="hasLandingTemplate" />
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-4 pt-4 border-t border-border">
      <div class="text-center">
        <div class="text-lg font-semibold text-foreground">
          {{ campaign.total_leads || 0 }}
        </div>
        <div class="text-xs text-muted-foreground">Leads</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-semibold text-foreground">
          {{ campaign.total_sends || 0 }}
        </div>
        <div class="text-xs text-muted-foreground">Envíos</div>
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
    <div v-if="showDate" class="mt-3 text-xs text-muted-foreground text-center">
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