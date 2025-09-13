<template>
  <UiCard>
    <UiCardContent class="text-center py-12">
      <Icon 
        :name="iconName" 
        :class="`mx-auto h-12 w-12 text-muted-foreground mb-4 ${iconClass}`" 
      />
      <h3 class="text-lg font-medium text-muted-foreground mb-2">{{ title }}</h3>
      <p class="text-muted-foreground mb-4">{{ description }}</p>
      <slot name="action" />
    </UiCardContent>
  </UiCard>
</template>

<script setup>
defineProps({
  iconName: {
    type: String,
    default: 'heroicons:inbox'
  },
  iconClass: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});
</script>