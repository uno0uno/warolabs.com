<template>
  <div class="flex-1 overflow-auto p-6">
    <EmailTemplateManager />
</div>
</template>

<script setup>

import { ref, onMounted } from 'vue';
import TheLoadingOverlay from '@/components/Commons/TheLoadingOverlay.vue';

const loading = ref(true);

</script>