<script setup>

const { public: { siteUrl }, } = useRuntimeConfig()

const stats = reactive({
  number1: '60%',
  title1: '60%',
  description1: '60%',
})

</script>

<template>
  <div class="flex flex-col gap-8 sm:gap-12 pb-12">
    <MarketingTheHero></MarketingTheHero>
    <MarketingTheLogoCloud></MarketingTheLogoCloud>
  </div>

      <Head>
        <Link rel="canonical" :href="`${siteUrl}`" />
        <Title >▷ Qué hacer en bogotá | waro colombia</Title>
        <Meta name="description" :content="`La cultura es un derecho de todos los ciudadanos. Apóyala!`" />

        <Meta property="og:type" content="website" />
        <Meta property="og:title" :content="`▷ Qué hacer en bogotá | waro colombia`" />
        <Meta property="og:description" :content="`La cultura es un derecho de todos los ciudadanos. ¡Apóyala!`" />
        <Meta property="og:image" :content="`https://warocolombia.infura-ipfs.io/ipfs/QmWy4HmmQZneM1FkAWQrS79pv1kkvMcCZg7zvcpB9b4oay`" />
        <Meta property="og:image:width" content="828" />
        <Meta property="og:image:height" content="450" />
        <Meta property="og:url" :content="`https://warocol.com`" />
        <Meta property="og:site_name" content="waro colombia" />

        <Meta name="twitter:card" content="summary_large_image" />
        <Meta name="twitter:site" content="@saifer101_" />
        <Meta name="twitter:title" :content="`▷ Qué hacer en bogotá | waro colombia`" />
        <Meta name="twitter:description" :content="`La cultura es un derecho de todos los ciudadanos. ¡Apóyala!`" />
        <Meta name="twitter:image" :content="`https://warocolombia.infura-ipfs.io/ipfs/QmWy4HmmQZneM1FkAWQrS79pv1kkvMcCZg7zvcpB9b4oay`" />
    </Head>
</template>