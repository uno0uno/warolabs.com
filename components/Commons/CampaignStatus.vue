<template>
  <span :class="statusClass">
    {{ statusText }}
  </span>
</template>

<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true
  }
});

const statusClass = computed(() => {
  const classes = {
    draft: 'px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    active: 'px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800',
    paused: 'px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
    completed: 'px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
    cancelled: 'px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'
  };
  return classes[props.status] || classes.draft;
});

const statusText = computed(() => {
  const texts = {
    draft: 'Borrador',
    active: 'Activa',
    paused: 'Pausada',
    completed: 'Completada',
    cancelled: 'Cancelada'
  };
  return texts[props.status] || props.status;
});
</script>