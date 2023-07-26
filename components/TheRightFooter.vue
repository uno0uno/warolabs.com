<script setup>

const pp = ref('Politica privacidad');
const tc = ref('Terminos y condiciones');
</script>

<template>
    <ul class="flex stems-start gap-2 sm:flex flex-col sm:items-end">
        <li class=" menu-foot-item ">
            <a href="/" class="text-normal text-slate-900 hover:text-indigo-400 whitespace-nowrap text-sm">{{pp}}</a>
        </li>
        <li class="menu-foot-item">
            <a href="/" class="text-normal text-slate-900 hover:text-indigo-400 whitespace-nowrap text-sm">{{tc}}</a>
        </li>
    </ul>
</template>

<style scoped>

</style>
