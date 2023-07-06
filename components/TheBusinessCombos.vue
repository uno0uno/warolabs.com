<script setup>

const router = useRouter();
const props = defineProps({ 
    combos: {type: Object}
    });

const { combos } = toRefs(props);

function displayText(value){
    return value.slice(0, 110) + '...';
}

function calculateAvailableReedems(reedemsNumber, redemptionsNumber) {
  if (redemptionsNumber === null || redemptionsNumber === undefined) {
    return reedemsNumber;
  }
  
  const availableReedems = reedemsNumber - redemptionsNumber;
  return availableReedems >= 0 ? availableReedems : 0;
}

async function openCombo(value){
    await navigateTo({ path: `/combo/${value}` });
    //router.push({name:"idCombo",params:{idCombo:value}});
}

</script>

<template>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4 md:px-0 mt-4">
    <div
    v-for=" item in combos"
    :key="item._id.$oid"
    class="p-4 w-full h-full rounded-lg cursor-pointer bg-slate-100 border-2">
    <div @click="openCombo(item._id.$oid)" class="flex flex-col gap-2">
            <div class="flex gap-2 items-center">
                <span class="relative flex h-3 w-3">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
                </span>
                <span class="text-m md:text-lg text-slate-900 text-text-subdued">{{ calculateAvailableReedems(item.redemptions_number, redemptions_number)}} disponibles</span>
            </div>
            <div class="">
                <p class="mb-0 text-2xl md:text-3xl font-bold text-slate-900">{{item.name}}</p>
            </div>

            <div class="flex gap-2">
                <p class="text-m md:text-normal text-gray-900 text-text-subdued">{{displayText(item.reazon_sell_product)}}</p>
            </div>
        </div>
    </div>
</div>

</template>