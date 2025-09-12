<template>
  <div :class="[
    'w-2 h-2 rounded-full',
    active ? 'bg-green-500' : 'bg-gray-300'
  ]"></div>
</template>

<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false
  }
});
</script>