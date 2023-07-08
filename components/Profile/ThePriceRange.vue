<script setup>

import { CurrencyDollarIcon } from '@heroicons/vue/24/solid'

</script>

<template>
    <div class="flex divide-x divide-dashed" >
        <div class="flex items-center font-normal">
            <CurrencyDollarIcon class="h-6 w-6 md:h-6 md:w-6 text-slate-900"/>
            <p class=" px-2 text-slate-900 text-m md:text-lg" itemprop="priceRange">$50.000 - $200.000 </p>
            <p itemprop="currenciesAccepted">COP</p>
        </div>
      </div>

</template>

<style lang="scss" scoped>

</style>