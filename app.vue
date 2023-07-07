<template>
    <div>
        <NuxtLayout>
            <NuxtPage/>
        </NuxtLayout>
    </div>
</template>

<script setup>

const route = useRoute()

const url = route.path
const siteName = process.env.APP_NAME
const type = 'website'
const locale = 'es-CO'


const head = () => {
  return [
    {
      tagName: 'meta',
      name: 'og:title',
      content: 'El condejero del desparche',
    },
    {
      tagName: 'meta',
      name: 'og:description',
      content: 'Una linda pagina donde las personas pueden ver lo que quieren',
    },
    {
      tagName: 'meta',
      name: 'og:image',
      content: 'https://dummyimage.com/1200x800/e600e6/ffffff' ,
    },
    {
      tagName: 'meta',
      name: 'og:url',
      content: url,
    },
    {
      tagName: 'meta',
      name: 'og:site_name',
      content: siteName,
    },
    {
      tagName: 'meta',
      name: 'og:type',
      content: type,
    },
    {
      tagName: 'meta',
      name: 'og:locale',
      content: locale,
    },
  ]
}

useHead(head)

useSeoMeta({
  title: 'My Amazing Site',
  ogTitle: 'My Amazing Site',
  description: 'This is my amazing site, let me tell you all about it.',
  ogDescription: 'This is my amazing site, let me tell you all about it.',
  ogImage: 'https://example.com/image.png',
  twitterCard: 'summary_large_image',
})

</script>

<style lang="scss" scoped>

</style>