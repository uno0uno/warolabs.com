<script setup>

import { MapPinIcon } from '@heroicons/vue/24/solid'

const props = defineProps({ 
    address: {type: String},
    city: {type: String},
    country: {type: String},
    });

const { address, city, country } = toRefs(props);

function displayTextStreet(value){
    return value.slice(0, 9) + '...';
}

function openGoogleMaps(destination) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;

  if (process.client) {
    window.open(googleMapsUrl, '_blank');
  }
}



</script>

<template>
    <div @click="openGoogleMaps(address)"
    class="flex divide-x divide-dashed cursor-pointer" itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
        <div class="flex items-center font-normal">
            <MapPinIcon class="h-6 w-6 md:h-6 md:w-6 text-slate-900"/>
            <p class=" px-2 text-slate-900 text-m md:text-lg" itemprop="streetAddress">{{displayTextStreet(address)}}</p>
        </div>
        <div class="flex items-center px-2 font-normal">
            <div class="flex" itemprop="addressLocality">
            <p class=" px-1 text-slate-900 text-m md:text-lg">{{city}},</p>
            <p class=" px-1 text-slate-900 text-m md:text-lg">{{country}}</p>
          </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>