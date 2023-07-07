
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
  
      <tbody class="divide-y divide-gray-200">
        <tr itemprop="openingHoursSpecification" itemscope itemtype="http://schema.org/OpeningHoursSpecification"
        class="odd:bg-gray-50">
            <td itemprop="dayOfWeek"
            class="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                Lunes
            </td>
            <td class="whitespace-nowrap px-4 py-2 text-gray-700">
                <time itemprop="opens">20:00</time>
            </td>
            <td td class="whitespace-nowrap px-4 py-2 text-gray-700">
                <time itemprop="closes">02:00</time>
            </td>
        </tr>
        <tr itemprop="openingHoursSpecification" itemscope itemtype="http://schema.org/OpeningHoursSpecification"
            class="odd:bg-gray-50">
            <td itemprop="dayOfWeek"
            class="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                Martes
            </td>
            <td class="whitespace-nowrap px-4 py-2 text-gray-700">
                <time itemprop="opens">20:00</time>
            </td>
            <td td class="whitespace-nowrap px-4 py-2 text-gray-700">
                <time itemprop="closes">02:00</time>
            </td>
        </tr>
        <tr itemprop="openingHoursSpecification" itemscope itemtype="http://schema.org/OpeningHoursSpecification"
            class="odd:bg-gray-50">
            <td itemprop="dayOfWeek"
            class="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                Miercoles
            </td>
            <td class="whitespace-nowrap px-4 py-2 text-gray-700">
                <time itemprop="opens">20:00</time>
            </td>
            <td td class="whitespace-nowrap px-4 py-2 text-gray-700">
                <time itemprop="closes">02:00</time>
            </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>

</style>