<script setup>
import { storeToRefs } from "pinia";
import { useGlobalData } from '../../store/useGlobalData';

const globalData = useGlobalData();
const { globalLoading } = storeToRefs(globalData);

definePageMeta({
    layout: 'landingv2'
});

const route = useRoute();
const slug = route.params.slug;

globalLoading.value = false;

const {
    data: landingData,
    pending,
    error: fetchError
} = await useAsyncData(
    `landing-page-${slug}`,
    async () => {
        const authToken = useCookie('auth_token');

        const response = await $fetch('/api/auth/get-token', {
            method: 'POST'
        });

        if (response.token) {
            authToken.value = response.token;
        } else {
            throw new Error('Failed to retrieve authentication token.');
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
</script>

<template>
    <div v-show="!globalLoading" class="w-full flex items-center justify-center h-full">
        <div class="text-center flex flex-col items-center w-full h-full justify-center gap-4 px-0 lg:min-w-[48rem] max-w-6xl lg:px-12 relative z-0 bg-slate-50">
            <LandingsTheHeroSectionLeftRight 
                v-if="landingData"
                :title="landingData.title"
                :description="landingData.description"
                :media-type="landingData.image.type"
                :media-src="landingData.image.content"
                :campaign-id="landingData.campaignId"
            />
        </div>
    </div>
    
    <div v-show="globalLoading" class="w-full flex items-center justify-center h-full">
        <CommonsTheLoading />
    </div>
</template>