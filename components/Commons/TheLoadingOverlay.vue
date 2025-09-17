<template>
  <Teleport to="body">
    <div 
      v-if="show"
      class="loading-overlay"
    >
      <CommonsTheLoading />
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  }
});
</script>