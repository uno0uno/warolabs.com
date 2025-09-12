<template>
  <Teleport to="body">
    <div 
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]"
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