<script setup>

const { userBusiness } = useRoute().params;

const { data: business, pending, refresh, execute, error } = await useAsyncData(
  'profile-info', 
  () => {
    try {
      return $fetch(`/api/businessInfo/magicV1?userBusiness=${userBusiness}`)
    } catch (error) {
      return error;
    }
  }
)

const meta = useSeoMeta({
  title: () => {
    if (business.value != null) {
      return `${toRaw(business.value.info.name)} - ${toRaw(business.value.info.city)}`
    } else {
      return 'Pagina no encontrada'
    }
  },
  ogTitle: () => {
    if (business.value != null) {
      return `${toRaw(business.value.info.name)} - ${toRaw(business.value.info.city)}`
    } else {
      return 'Pagina no encontrada'
    }
  },
  description: () => {
    if (business.value != null) {
      return `${toRaw(business.value.info.description)}`
    } else {
      return 'My App Description'
    }
  },
  ogDescription: () => {
    if (business.value != null) {
      return `${toRaw(business.value.info.description)}`
    } else {
      return 'My App Description'
    }
  },
  ogImage: 'https://dummyimage.com/1200x800/3ea63c/ffffff',
  twitterCard: 'summary_large_image',
  default: {
    title: 'My App Title',
    description: 'My App Description',
  },
})


</script>

<template>

    <div v-if="pending">
        LOADING...
    </div>

    <div v-else-if="error">Error al cargar los datos: {{ error }}</div>

    <div v-else class="flex flex-col gap-6" itemscope itemtype="https://schema.org/NightClub">
        <TheBusinessHeader
        v-bind:logo_bussines="business.info.logo_bussines"
        v-bind:name="business.info.name"
        v-bind:address="business.info.address"
        v-bind:country="business.info.country"
        v-bind:city="business.info.city"
        v-bind:description="business.info.description"
        
        >
        </TheBusinessHeader>
      <div class="mx-auto max-h-full font-principal">

          <div class="border-0 border-b-[1px] border-solid border-b-border-primary flex-nowrap flex overflow-x-auto overflow-y-hidden jpg-scrollbar-thumb-none mx-0">
            <h2 class=" text-lg text-slate-900 first:ml-0 inline-flex text-m md:text-xl font-bold capitalize hover:text-text-default relative bg-transparent outline-none mx-4 mb-[-1px] border-0 border-b-[3px] border-solid pb-2 whitespace-nowrap border-b-text-link text-text-link mr-1">
              Promociones 
            </h2>
          </div>

        <TheBusinessCombos 
          v-bind:combos="business.combos">
        </TheBusinessCombos>
      </div>

      <div class="">

          <div class="border-0 border-b-[1px] border-solid border-b-border-primary flex-nowrap flex overflow-x-auto overflow-y-hidden jpg-scrollbar-thumb-none mx-0">
            <h2 class=" text-lg text-slate-900 first:ml-0 inline-flex text-m md:text-xl font-bold capitalize hover:text-text-default relative bg-transparent outline-none mx-4 mb-[-1px] border-0 border-b-[3px] border-solid pb-2 whitespace-nowrap border-b-text-link text-text-link mr-1">
              FAQs de {{ business.info.name }} 
            </h2>
          </div>

      </div>

      <ProfileTheFaqs/>

    </div>



  </template>