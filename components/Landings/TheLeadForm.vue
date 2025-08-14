<script setup>
import { ref } from 'vue';
import { storeToRefs } from "pinia";
import { navigateTo } from '#app';
import { useCookie, useRoute, toRefs } from '#imports';


import { useGlobalData } from '../../store/useGlobalData';

const globalData = useGlobalData();
const { globalLoading } = storeToRefs(globalData);

const props = defineProps({
    campaignId: {
        type: String,
        required: true
    }
});

const route = useRoute();
const slug = route.params.slug;
const { campaignId } = toRefs(props);

const leadName = ref('');
const leadEmail = ref('');
const leadPhone = ref('');

const submitLead = async () => {
    globalLoading.value = true;
    const authToken = useCookie('auth_token');

    try {
        const encryptedData = await $fetch('/api/utils/encrypt-data', {
            method: 'POST',
            body: {
                leadEmail: leadEmail.value
            },
            headers: {
                'Authorization': `Bearer ${authToken.value}`
            }
        });

        const bodyPayload = {
            encryptedCampaignId: campaignId.value,
            encryptedLeadEmail: encryptedData.encryptedLeadEmail,
            profileName: leadName.value,
            profilePhoneNumber: leadPhone.value,
            leadSource: 'Landing Page Form',
            profileNationalityId: 1
        };

        await $fetch('/api/marketing/createLeadCampain', {
            method: 'POST',
            body: bodyPayload,
            headers: {
                'Authorization': `Bearer ${authToken.value}`
            }
        });

        leadName.value = '';
        leadEmail.value = '';
        leadPhone.value = '';

        await navigateTo(`/thankyou/${slug}`, { replace: true });

        globalLoading.value = false;

    } catch (error) {
        globalLoading.value = false;
        console.error('Error al crear el lead:', error);
        alert('Hubo un error al enviar el formulario.');
    } finally {
        globalLoading.value = false;
    }
};
</script>

<template>
    <form @submit.prevent="submitLead" class="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">Regístrate y recibe más información</h2>

        <div class="mb-4">
            <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Nombre</label>
            <input id="name" v-model="leadName" type="text"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required />
        </div>

        <div class="mb-4">
            <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Correo electrónico</label>
            <input id="email" v-model="leadEmail" type="email"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required />
        </div>

        <div class="mb-6">
            <label for="phone" class="block text-gray-700 text-sm font-bold mb-2">Número de teléfono</label>
            <input id="phone" v-model="leadPhone" type="tel"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required />
        </div>

        <button type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
            Enviar
        </button>
    </form>
</template>