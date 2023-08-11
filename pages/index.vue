<script setup>
const h2 = ref('¿Cansado de los mismos lugares?');
const stats = reactive({
  number1: '60%',
  title1: '60%',
  description1: '60%',
})

</script>

<template>
  <div class="flex flex-col gap-6 sm:gap-24 py-4 sm:pb-12">
    
    <MarketingTheBannerTwoGrid></MarketingTheBannerTwoGrid>
    <MarketingTheCtaOne></MarketingTheCtaOne>
    <MarketingTheStats
      v-bind:title="h2"
    ></MarketingTheStats>
    <MarketingTheComponent></MarketingTheComponent>
    <MarketingTheTestimonial></MarketingTheTestimonial>

    
    <MarketingTheLogoCloud></MarketingTheLogoCloud>
  </div>
</template>