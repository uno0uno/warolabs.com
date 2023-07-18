<script setup>

import { MapPinIcon } from '@heroicons/vue/24/outline';
import { GlobeAmericasIcon } from '@heroicons/vue/24/solid';

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
        <h1 class="text-2xl md:text-4xl font-extrabold text-slate-900">{{props.name_product}}</h1>
        <div class="flex flex-col gap-2 ">
            <div class="flex items-center gap-1 ">
                <MapPinIcon class="h-4 w-4 md:h-6 md:w-6 text-slate-800"/>
                <p class="md:text-base text-slate-900 font-Rubik text-sm">{{night_club_info.city}} - {{night_club_info.address}}</p>
            </div>
        </div>
    </div>
</template>
