<script setup>
import { HomeIcon, InformationCircleIcon, BriefcaseIcon, Squares2X2Icon, PhoneIcon } from '@heroicons/vue/24/outline';

const menuItems = [
    { icon: HomeIcon, label: 'Laboratorios' },
    { icon: PhoneIcon, label: 'Eventos' },
    { icon: PhoneIcon, label: 'Equipo' },
];
</script>

<template>
    <nav class="flex flex-col gap-4">
        <ul class="list-none p-0 m-0 flex flex-wrap justify-start lg:justify-center gap-4">
            <li class="flex items-center gap-2 text-white w-1/4 md:w-auto hover:text-gray-900 transition-colors"
                v-for="(item, index) in menuItems" :key="index">
                <span>{{ item.label }}</span>
            </li>
        </ul>
    </nav>
</template>
