<script setup>
import { HomeIcon, InformationCircleIcon, BriefcaseIcon, Squares2X2Icon, PhoneIcon } from '@heroicons/vue/24/outline';

const menuItems = [
    { icon: HomeIcon, label: 'Laboratorios' },
    { icon: PhoneIcon, label: 'Equipo' },
    { icon: PhoneIcon, label: 'Eventos' },
];
</script>

<template>
    <nav class="flex flex-col gap-4">
        <ul class="list-none p-0 m-0 flex flex-wrap justify-start lg:justify-center gap-4">
            <li class="flex md:items-center gap-2 text-white md:w-auto hover:text-violet-500 transition-colors cursor-pointer"
                v-for="(item, index) in menuItems" :key="index">
                <!-- <component :is="item.icon" class="h-6 w-6" /> -->
                <span>{{ item.label }}</span>
            </li>
        </ul>
    </nav>
</template>
