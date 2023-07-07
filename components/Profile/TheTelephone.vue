<script setup>


const pNumber = ref(3142047013);

function openWhatsApp(phoneNumber) {
    if (process.client) {
    const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phoneNumber)}`;
    window.open(url, '_blank');
  }
}

</script>

<template>
    <div @click="openWhatsApp(pNumber)" class="flex divide-x divide-dashed cursor-pointer" >
        <div class="flex items-center font-normal">
            <TheWatsapp class="h-6 w-6 md:h-6 md:w-6 text-slate-900"/>
            <p class=" px-2 text-slate-900 text-m md:text-lg" itemprop="telephone">3142047013</p>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>