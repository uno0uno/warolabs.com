<template>
  <div class="dashboard-page">
    <!-- Loading mientras redirige -->
    <CommonsTheLoading />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'marketing',
  middleware: 'marketing-redirect'
});
</script>
