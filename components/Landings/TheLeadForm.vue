<script setup>
import { storeToRefs } from "pinia";
import { useGlobalData } from '../../store/useGlobalData';
import { useFormValidation } from '../../composables/useFormValidation';
import AlertLine from '../Commons/AlertLine.vue';

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

const formData = ref({
    name: '',
    email: '',
    phone: '',
});

const serverError = ref(null);

const { errors, validate, validateField } = useFormValidation(formData);

const isFormValid = computed(() => {
    return Object.values(errors.value).every(error => error === null);
});

const alertMessage = computed(() => {
    if (serverError.value) {
        return serverError.value;
    }
    if (!isFormValid.value) {
        return 'Por favor, corrige los errores en el formulario para poder continuar.';
    }
    return null;
});

const submitLead = async () => {
    serverError.value = null;
    errors.value = {}; 

    if (!validate()) {
        return;
    }
    
    globalLoading.value = true;

    try {
        const tokenResponse = await $fetch('/api/auth/get-token', { method: 'POST' });
        const authToken = tokenResponse.token;

        const encryptedData = await $fetch('/api/utils/encrypt-data', {
            method: 'POST',
            body: { leadEmail: formData.value.email },
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const bodyPayload = {
            encryptedCampaignId: campaignId.value,
            encryptedLeadEmail: encryptedData.encryptedLeadEmail,
            profileName: formData.value.name,
            profilePhoneNumber: formData.value.phone,
            leadSource: 'Landing Page Form',
            profileNationalityId: 1
        };

        await $fetch('/api/marketing/createLeadCampain', {
            method: 'POST',
            body: bodyPayload,
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        formData.value.name = '';
        formData.value.email = '';
        formData.value.phone = '';

        await navigateTo(`/thankyou/${slug}`, { replace: true });
        
    } catch (error) {
  
        if (error.response && error.response._data) {
            serverError.value = error.response._data.message || 'Hubo un error en el servidor. Por favor, inténtalo de nuevo.';
        } else {
            serverError.value = 'Hubo un error de red. Revisa tu conexión a internet.';
        }
    } finally {
        globalLoading.value = false;
    }
};
</script>

<template>
    <form @submit.prevent="submitLead" class="bg-gray-100 p-6 border-2 border-slate-900 text-left flex flex-col gap-4">
        <h2 class="text-2xl font-semibold text-left">Regístrate y recibe más información</h2>
        
        <AlertLine v-if="alertMessage" type="error">
            {{ alertMessage }}
        </AlertLine>

        <div class="flex flex-col gap-2">
            <div class="text-left">
                <label for="name" class="block text-gray-700 text-sm font-bold mb-2 text-left">Nombre</label>
                <p v-if="errors.name" class="text-red-500 text-xs italic mb-1">{{ errors.name }}</p>
                <input id="name" v-model="formData.name" type="text"
                    :class="{'border-red-500': errors.name}"
                    class="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-left"
                    @blur="validateField('name')" />
            </div>

            <div class="text-left">
                <label for="email" class="block text-gray-700 text-sm font-bold mb-2 text-left">Correo
                    electrónico</label>
                <p v-if="errors.email" class="text-red-500 text-xs italic mb-1">{{ errors.email }}</p>
                <input id="email" v-model="formData.email" type="email"
                    :class="{'border-red-500': errors.email}"
                    class="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-left"
                    @blur="validateField('email')" />
            </div>

            <div class="text-left">
                <label for="phone" class="block text-gray-700 text-sm font-bold mb-2 text-left">Número de
                    teléfono</label>
                <p v-if="errors.phone" class="text-red-500 text-xs italic mb-1">{{ errors.phone }}</p>
                <input id="phone" v-model="formData.phone" type="tel"
                    :class="{'border-red-500': errors.phone}"
                    class="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-left"
                    @blur="validateField('phone')" />
            </div>
        </div>

        <button type="submit"
            :disabled="!isFormValid"
            :class="{'bg-slate-300 cursor-not-allowed': !isFormValid, 'bg-slate-800 hover:bg-slate-900': isFormValid}"
            class="text-white font-bold py-2 px-4 focus:outline-none focus:shadow-outline w-full text-left">
            Enviar
        </button>
    </form>
</template>