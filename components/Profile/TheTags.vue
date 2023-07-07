<script setup>

const tagsBusiness = ref (["Dancehall","Hip-Hop","Rock"])

</script>

<template>
    <div class="flex gap-2">
        <div v-for=" tagBusiness in tagsBusiness" :key="tagBusiness">
            <div class="bg-slate-100 py-1 px-2 rounded-lg">
                <p class="text-slate-900 md:text-lg text-m">{{tagBusiness}}</p>
            </div>
        </div>
  </div>
</template>

<style lang="scss" scoped>

</style>