<script setup>

const pp = ref('Politica privacidad');
const tc = ref('Terminos y condiciones');
</script>

<template>
    <ul class="flex gap-2 sm:flex sm:flex-col sm:items-end">
        <li class=" menu-foot-item text-end">
            <a href="/" class="text-normal text-slate-900 hover:text-indigo-400 whitespace-nowrap text-sm">{{pp}}</a>
        </li>
        <li class="menu-foot-item text-end">
            <a href="/" class="text-normal text-slate-900 hover:text-indigo-400 whitespace-nowrap text-sm">{{tc}}</a>
        </li>
    </ul>
</template>

<style scoped>

</style>
