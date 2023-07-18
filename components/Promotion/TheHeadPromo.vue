<script setup>

import { MapPinIcon } from '@heroicons/vue/24/outline';
import { GlobeAmericasIcon } from '@heroicons/vue/24/solid';
import { BuildingStorefrontIcon } from '@heroicons/vue/24/solid';

const props = defineProps({ 
    name_product: {type: String},  
    night_club_info: {type: Object}
    });

const { name_product, night_club_info } = toRefs(props);

</script>

<template>
    <div class="flex flex-col gap-1 sm::gap-2">
        <div class="flex">
            <div class="flex items-center gap-2">
                <p class="md:my-0 rounded border bg-slate-100 border-slate-900 px-0.5 text-slate-900 text-sm text-center">Producto certificado</p>
            </div>
        </div>
        <h1 itemprop="name" class="text-2xl md:text-4xl font-extrabold text-slate-900">{{props.name_product}}</h1>

        <ProfileTheAddress
        v-bind:address="night_club_info.address"
        v-bind:city="night_club_info.city"
        v-bind:country="night_club_info.country"
        >
      </ProfileTheAddress>

      <div class="flex divide-x divide-dashed cursor-pointer">
          <div class="flex items-start font-normal">
            <BuildingStorefrontIcon class="h-6 w-6 md:h-6 md:w-6 text-slate-900"/>
              <p class=" px-1 text-slate-900 text-m md:text-lg">Vendedor:</p>
              <span itemprop="seller" itemscope itemtype="http://schema.org/Organization">
                <p itemprop="name"
                class=" px-1 text-slate-900 text-m md:text-lg">{{night_club_info.name}}</p>
                </span>
          </div>
      </div>
    </div>
</template>
