<template>
    <div>
        <p>Name bussines for {{ idCombo }}</p>
    </div>
</template>

<script setup>
const { idCombo } = useRoute().params

definePageMeta({
  layout: 'combos'
})

</script>

<style scoped>

</style>
