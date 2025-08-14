<script setup>
import { CheckCircleIcon } from '@heroicons/vue/24/solid';
import { useRoute, navigateTo } from '#imports';
import { computed } from 'vue';

definePageMeta({
    layout: 'landing',
});

const route = useRoute();
const slug = route.params.slug;

if (!slug || slug === 'undefined') {
    navigateTo('/');
}

const formattedEventName = computed(() => {
    const spacedSlug = slug.replace(/-/g, ' ');

    return spacedSlug.split(' ').map(word => {
        if (word.length > 0) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return '';
    }).join(' ');
});

useHead({
    title: `Gracias | ${formattedEventName.value}`,
    meta: [{ name: 'robots', content: 'noindex, nofollow' }]
});
</script>

<template>
    <div class="flex-grow flex items-center justify-center text-center p-4">
        <div class="p-8 max-w-lg w-full flex flex-col gap-2">
            <CheckCircleIcon class="h-24 w-24 text-green-500 mx-auto" />
            <div class="flex flex-col gap-1">
                <h1 class="text-4xl font-bold">¡Muchas gracias por tu interés!</h1>
                <p class="text-lg text-gray-600">Hemos recibido tu registro para: </p>
                <p class="font-semibold text-black">{{ formattedEventName }}</p>.
            </div>
            <div class="flex flex-col gap-4">
                <p class="text-md text-gray-500">
                    Te hemos enviado un correo electrónico con **información muy importante**.
                    Por favor, revisa tu bandeja de entrada para no perderte de nada. ¡Te esperamos!
                </p>
                <NuxtLink to="/"
                    class="inline-block bg-black text-white font-semibold px-6 py-3 rounded-md hover:bg-gray-800 transition-colors duration-300">
                    Volver al Inicio
                </NuxtLink>
            </div>

        </div>
    </div>
</template>