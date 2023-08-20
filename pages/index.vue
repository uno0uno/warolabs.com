<script setup>
const h2 = ref('¿Cansado de los <br /> mismos lugares?');
const stats = reactive({
  number1: '60%',
  title1: '60%',
  description1: '60%',
})

</script>

<template>
  <div class="flex flex-col gap-12 sm:gap-20 pb-12">
    <MarketingTheHero></MarketingTheHero>
    <MarketingTheStats
      v-bind:title="h2"
    ></MarketingTheStats>
    <MarketingTheComponent></MarketingTheComponent>
    <MarketingTheLogoCloud></MarketingTheLogoCloud>
  </div>

      <Head>
        <Title >▷ Qué hacer en bogotá | Waro Colombia</Title>
        <Meta name="description" :content="`La cultura es un derecho de todos los ciudadanos. ¡Apóyala!`" />

        <Meta property="og:type" content="website" />
        <Meta property="og:title" :content="`▷ Qué hacer en bogotá | Waro Colombia`" />
        <Meta property="og:description" :content="`La cultura es un derecho de todos los ciudadanos. ¡Apóyala!`" />
        <Meta property="og:image" :content="`https://warocolombia.infura-ipfs.io/ipfs/Qmf2N1fW4SKpgrY5Zy1nvVJsWTsPJVZYPyYbUuQWjBCsFt`" />
        <Meta property="og:image:width" content="828" />
        <Meta property="og:image:height" content="450" />
        <Meta property="og:url" :content="`https://warocol.com`" />
        <Meta property="og:site_name" content="Waro Colombia" />

        <Meta name="twitter:card" content="summary_large_image" />
        <Meta name="twitter:site" content="@saifer101_" />
        <Meta name="twitter:title" :content="`▷ Qué hacer en bogotá | Waro Colombia`" />
        <Meta name="twitter:description" :content="`La cultura es un derecho de todos los ciudadanos. ¡Apóyala!`" />
        <Meta name="twitter:image" :content="`https://warocolombia.infura-ipfs.io/ipfs/Qmf2N1fW4SKpgrY5Zy1nvVJsWTsPJVZYPyYbUuQWjBCsFt`" />
    </Head>
</template>