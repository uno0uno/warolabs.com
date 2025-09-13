<template>
  <UiButton
    :disabled="loading || disabled"
    :variant="variant"
    :size="size"
    :class="class"
    @click="handleClick"
  >
    <Icon 
      v-if="loading" 
      name="heroicons:arrow-path" 
      class="w-4 h-4 mr-2 animate-spin" 
    />
    <slot v-if="!loading" name="icon" />
    {{ loading ? loadingText : text }}
  </UiButton>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    required: true
  },
  loadingText: {
    type: String,
    default: 'Cargando...'
  },
  variant: {
    type: String,
    default: 'default'
  },
  size: {
    type: String,
    default: 'default'
  },
  class: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click']);

const handleClick = (event) => {
  emit('click', event);
};
</script>