<script setup>
const h2 = ref('¿Cansado de los <br /> mismos lugares?');
const stats = reactive({
  number1: '60%',
  title1: '60%',
  description1: '60%',
})

</script>

<template>
  <div class="flex flex-col gap-12 sm:gap-20 sm:pb-12">
    <MarketingTheHero></MarketingTheHero>
    <MarketingTheStats
      v-bind:title="h2"
    ></MarketingTheStats>
    <MarketingTheComponent></MarketingTheComponent>
    <MarketingTheTestimonial></MarketingTheTestimonial>

    
    <MarketingTheLogoCloud></MarketingTheLogoCloud>
  </div>
</template>