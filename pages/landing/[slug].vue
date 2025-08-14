<script setup>
import { storeToRefs } from "pinia";
import { computed, watch, ref } from 'vue';
import { useRoute, useCookie, useAsyncData } from '#imports';

import LandingsTheHeroSectionLeftRight from '~/components/Landings/TheHeroSectionLeftRight.vue';
import LandingsTheLeadForm from '~/components/Landings/TheLeadForm.vue';

import { useGlobalData } from '../../store/useGlobalData';

const globalData = useGlobalData();
const { globalLoading } = storeToRefs(globalData);

definePageMeta({
    middleware: 'auth',
    layout: 'landing'
});

const route = useRoute();
const slug = route.params.slug;
const authToken = useCookie('auth_token');


// 💡 Activa el loader globalmente
globalLoading.value = false;

console.log('Fetching landing page for slug:', slug);
console.log('Auth token:', authToken.value);

const {
    data: landingData,
    pending,
    error: fetchError
} = await useAsyncData(
    `landing-page-${slug}`,
    () => {
        if (!authToken.value) {
            throw new Error('Authentication token is not available.');
        }
        return $fetch(`/api/landings/${slug}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken.value}`
            }
        });
    }
);

watch(pending, (newPending) => {
    if (!newPending) {
        globalLoading.value = true;
    }
});

const processedSections = computed(() => {
    if (!landingData.value || !landingData.value.sections) {
        return [];
    }
    return landingData.value.sections.map(section => {
        return {
            ...section,
            props: {
                ...section.props,
                campaignId: landingData.value.campaignId
            }
        };
    });
});

const components = {
    LandingsTheHeroSectionLeftRight,
    LandingsTheLeadForm
};
</script>

<template>
    <div v-if="!globalLoading">
        <div v-for="(section, index) in processedSections" :key="index">
            <component :is="components[section.component]" v-bind="section.props" />
        </div>
    </div>
    <div v-else="globalLoading">
        <CommonsTheLoading />
    </div>
</template>