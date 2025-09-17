<template>
  <div class="bg-muted/50 p-6 flex items-center gap-4">
    <div class="text-2xl">
      <component :is="iconComponent" class="w-8 h-8 text-muted-foreground" />
    </div>
    <div>
      <div class="text-2xl font-bold">{{ value }}</div>
      <div class="text-sm text-muted-foreground">{{ label }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  UserGroupIcon,
  UsersIcon,
  ChartBarIcon,
  BoltIcon,
  MegaphoneIcon,
  PlayIcon,
  DocumentIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  DocumentDuplicateIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  value: {
    type: [String, Number],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  }
});

const iconComponent = computed(() => {
  const iconMap = {
    'heroicons:user-group': UserGroupIcon,
    'heroicons:users': UsersIcon,
    'heroicons:chart-bar': ChartBarIcon,
    'heroicons:bolt': BoltIcon,
    'heroicons:megaphone': MegaphoneIcon,
    'heroicons:play': PlayIcon,
    'heroicons:document': DocumentIcon,
    'heroicons:check-circle': CheckCircleIcon,
    'heroicons:document-text': DocumentTextIcon,
    'heroicons:envelope': EnvelopeIcon,
    'heroicons:globe-alt': GlobeAltIcon,
    'heroicons:document-duplicate': DocumentDuplicateIcon
  }
  
  return iconMap[props.icon] || DocumentIcon
})
</script>