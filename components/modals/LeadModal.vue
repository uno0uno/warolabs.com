<template>
  <UiModal :model-value="isOpen" title="Únete a la comunidad" @update:model-value="(v) => v ? null : close()">
    <ModalsLeadModalForm :button-source="buttonSource" @close="close" />
  </UiModal>
  <UiBottomSheetModal :model-value="isOpen" title="Únete a la comunidad" @update:model-value="(v) => v ? null : close()">
    <ModalsLeadModalForm :button-source="buttonSource" @close="close" />
  </UiBottomSheetModal>
</template>

<script setup lang="ts">
const { isOpen, buttonSource, close } = useLeadModal();
</script>
