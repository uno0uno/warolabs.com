<script setup>

const props = defineProps({ 
  opening_hours: {type: Object}
  });

const { opening_hours } = toRefs(props);

</script>

<template>
<div class="overflow-x-auto rounded-lg border border-gray-200">
    <table class="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
        <thead class="text-left rtl:text-right">
        <tr>
          <th class="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
            Día
          </th>
          <th class="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
            Apertura
          </th>
          <th class="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
            Cierre
          </th>
        </tr>
      </thead>

  
      <tbody class="divide-y">
        <tr v-for="item in opening_hours" :key="item.id" itemprop="openingHoursSpecification" itemscope itemtype="http://schema.org/OpeningHoursSpecification" >
          <td itemprop="dayOfWeek" class="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
            {{ item.day }}
          </td>
          <td class="whitespace-nowrap px-4 py-2 text-gray-700">
            <time itemprop="opens">{{ item.open_hour }}</time>
          </td>
          <td class="whitespace-nowrap px-4 py-2 text-gray-700">
            <time itemprop="closes">{{ item.close_hour }}</time>
          </td>
        </tr>
      </tbody>      
    </table>
  </div>
</template>

<style lang="scss" scoped>

</style>