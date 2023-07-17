<script setup>

</script>

<template>

    <nav class="flex justify-start gap-6 text-lg text-slate-600 font-normal" style="list-style: none;">
        <li class="cursor-pointer">
          <NuxtLink :to="{ path: `/`}">
            <theImgLogo/>
          </NuxtLink>
        </li>
        <li class="cursor-pointer">
            <NuxtLink :to="{ path: `/discotecas/101` }">
                Business 101
            </NuxtLink>
        </li>
        <!-- <li class="cursor-pointer">
            <NuxtLink :to="{ name: 'combo'}">
                Explorar
            </NuxtLink>
        </li>
        <li class="cursor-pointer">
          Opinion
        </li>
        <li class="cursor-pointer">
          Life style
        </li>
        <li class="cursor-pointer">
          Cripto
        </li>
        <li class="cursor-pointer">
          Anunciar -->
        <!-- </li> -->
    </nav>
      

</template>

<style scoped>

</style>
