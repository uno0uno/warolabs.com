<script setup>

const props = defineProps({ 
    logo_bussines: {type: String},
    name: {type: String},
    address: {type: String},
    country: {type: String},
    city: {type: String},
    description: {type: String},
    whatsapp: {type: Number},
    min_price: {type: Number},
    max_price: {type: Number},
    category_tags: {type: Object}
    });

const { logo_bussines,name,address,country, city, description, whatsapp, min_price, max_price, category_tags } = toRefs(props);

</script>

<template>
<div class="flex flex-col justify-start gap-6 font-principal">
    <div class="relative sm:top-20 top-8">
      <div class=" h-auto w-full rounded-lg bg-slate-50">
        <div class="mx-auto px-2 sm:px-8 flex-col">
          <img itemprop="image"
            class="h-24 md:w-36 md:h-36 rounded-3xl absolute top-0 -translate-y-1/2 border-4 border-white"
            v-bind="{'src':`https://warocolombia.infura-ipfs.io/ipfs/${logo_bussines}`, 'alt':`${name}, ${city}-${country} | waro colombia`}">
          </div>
        <div class="pt-14 md:pt-24 flex flex-col gap-4 mx-auto p-4 sm:px-8 max-h-full">
          <div class="flex flex-col md:flex items-start gap-2">
            <h1 class="text-3xl md:text-5xl font-bold text-slate-900" itemprop="name">{{name}}</h1>

              <ProfileTheAddress
                v-bind:address="address"
                v-bind:country="country"
                v-bind:city="city"
                >
              </ProfileTheAddress>

              <ProfileTheTelephone
                v-bind:whatsapp="whatsapp"
                >
              </ProfileTheTelephone>

              <ProfileThePriceRange
                v-bind:min_price="min_price"
                v-bind:max_price="max_price"
              >
              </ProfileThePriceRange>

              <ProfileTheTags
                v-bind:category_tags="category_tags"
              >
              </ProfileTheTags>

          </div>
        </div>
      </div>
    </div>
      <div class=" sm:-mx-8 pt-4 sm:pt-16 sm:px-8 sm:gap-2 gap-0 flex flex-col space-y-2 sm:flex-col  sm:space-y-0">
          <div class="flex gap-2 w-full">
            <button class="w-full  rounded-lg text-m font-semibold py-3 px-4 bg-slate-900 text-white hover:bg-slate-800 cursor-pointer border-2 ">
              opinar
            </button>         
              <CommonTheShareBox/>
          </div>
      </div>

</div>
    
</template>