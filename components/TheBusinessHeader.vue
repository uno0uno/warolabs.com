<script setup>

import { GlobeAltIcon } from '@heroicons/vue/24/solid'
import { CheckBadgeIcon } from '@heroicons/vue/24/solid'
import { PhoneIcon } from '@heroicons/vue/24/solid'
import { CurrencyDollarIcon } from '@heroicons/vue/24/solid'

const showFullText = ref(false);
const tagsBusiness = ref (["Dancehall","Hip-Hop","Rock"])

const props = defineProps({ 
    logo_bussines: {type: String},
    name: {type: String},
    address: {type: String},
    country: {type: String},
    city: {type: String},
    description: {type: String},
    });

const { logo_bussines,name,address,country, city, description } = toRefs(props);


const displayText = computed(() => {
  if (showFullText.value) {
    return description.value;
  } else {
    return description.value.slice(0, 120) + '...';
  }
});

function displayTextStreet(value){
    return value.slice(0, 9) + '...';
}

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
        <div class="flex divide-x divide-dashed" itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
            <div class="flex items-center font-normal">
                <CheckBadgeIcon class="h-6 w-6 md:h-8 md:w-8 text-slate-900"/>
                <p class=" px-2 text-slate-900 text-m md:text-lg" itemprop="streetAddress">{{displayTextStreet(address)}}</p>
            </div>
            <div class="flex items-center px-2 font-normal">
                <GlobeAltIcon class="h-6 w-6 md:h-6 md:w-6 text-slate-900"/>
                <div class="flex" itemprop="addressLocality">
                <p class=" px-1 text-slate-900 text-m md:text-lg">{{city}},</p>
                <p class=" px-1 text-slate-900 text-m md:text-lg">{{country}}</p>
              </div>
            </div>
        </div>

        <div class="flex divide-x divide-dashed" >
          <div class="flex items-center font-normal">
              <PhoneIcon class="h-6 w-6 md:h-6 md:w-6 text-slate-900"/>
              <p class=" px-2 text-slate-900 text-m md:text-lg" itemprop="telephone">(+57) 3142047013</p>
          </div>
      </div>
      <div class="flex divide-x divide-dashed" >
        <div class="flex items-center font-normal">
            <CurrencyDollarIcon class="h-6 w-6 md:h-6 md:w-6 text-slate-900"/>
            <p class=" px-2 text-slate-900 text-m md:text-lg" itemprop="priceRange">$50.000 - $200.000 </p>
        </div>
      </div>
        <div class="flex gap-2">
              <div v-for=" tagBusiness in tagsBusiness" :key="tagBusiness">
                  <div class="bg-slate-100 py-1 px-2 rounded-lg">
                      <p class="text-slate-900 md:text-lg text-m">{{tagBusiness}}</p>
                  </div>
              </div>
          </div>
      </div>

      <!-- <div class="flex flex-col gap-2">
        <div class="w-full lg:w-1/2">
          <p class="text-m md:text-lg text-gray-900">
            {{ displayText }}
          </p>
        </div>
        <button v-if="!showFullText" class="text-sm md:text-lg font-bold text-left text-slate-900" @click="showFullText = true">+ Ver más</button>
        <button v-else class="text-sm md:text-lg font-bold text-left text-slate-900" @click="showFullText = false">- Ver menos</button>
      </div> -->
    </div>
      </div>
    </div>
      <div class=" sm:-mx-8 pt-4 sm:pt-16 sm:px-8 sm:gap-2 gap-0 flex flex-col space-y-2 sm:flex-col  sm:space-y-0">

          <div class="flex gap-2 w-full">
            <button class="w-full  rounded-lg text-m font-semibold py-3 px-4 bg-slate-900 text-white hover:bg-slate-200 cursor-pointer border-2 ">
              <span>Opinar<!-- --> 
              </span>
            </button>

            <button class="w-full  rounded-lg text-m font-semibold py-3 px-4 bg-slate-100 text-slate-900 hover:bg-slate-200 cursor-pointer border-2">
              <span>Pago manual<!-- --> 
              </span>
            </button>
          </div>
          <div class="flex gap-2">
            <button class="w-full  rounded-lg text-m font-semibold py-3 px-4 bg-slate-100 text-slate-900 hover:bg-slate-200 cursor-pointer border-2 ">
              <span>🔥 200<!-- --> 
              </span>
            </button>

            <button class="w-full  rounded-lg text-m font-semibold py-3 px-4 bg-slate-100 text-slate-900 hover:bg-slate-200 cursor-pointer border-2">
              <span>Compartir<!-- --> 
              </span>
            </button>
          </div>

      </div>

</div>
    
</template>