
<!-- // components/Landings/TheLeadForm.vue -->
<script setup>
import { ref, computed, watch, onMounted, toRefs } from "vue";
import { storeToRefs } from "pinia";
import { useGlobalData } from '../../store/useGlobalData';
import { useFormValidation } from '../../composables/useFormValidation';

const globalData = useGlobalData();
const {
    globalLoading,
    countries,
    selectedCountry,
    countrySearchQuery,
    filteredCountries
} = storeToRefs(globalData);
const {
    setGlobalLoading,
    selectCountry
} = globalData;

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
    phoneCountryCode: ''
});

const serverError = ref(null);

const { errors, validate, validateField } = useFormValidation(formData, countries);

const isFormValid = computed(() => {
    return Object.values(errors.value).every(error => error === null) && formData.value.phoneCountryCode.length > 0;
});

const allErrorsList = computed(() => {
    let combinedErrors = Object.values(errors.value).filter(error => error !== null);
    if (serverError.value) {
        combinedErrors.unshift(serverError.value);
    }
    return combinedErrors;
});

const showCountryDropdown = ref(false);
const countryDropdownRef = ref(null);

const countryInputDisplay = computed({
    get() {
        return selectedCountry.value ? selectedCountry.value.name : countrySearchQuery.value;
    },
    set(value) {
        selectCountry(null);
        countrySearchQuery.value = value;
        validateField('phoneCountryCode');
    }
});

const validateAll = () => {
    validateField('name');
    validateField('email');
    validateField('phone');
    validateField('phoneCountryCode');
};

const submitLead = async () => {
    serverError.value = null;
    errors.value = {};

    validateAll();

    if (!isFormValid.value) {
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
            profileNationalityId: 1,
            profilePhoneCountryCode: formData.value.phoneCountryCode
        };

        await $fetch('/api/marketing/createLeadCampain', {
            method: 'POST',
            body: bodyPayload,
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        formData.value.name = '';
        formData.value.email = '';
        formData.value.phone = '';
        formData.value.phoneCountryCode = '';
        selectCountry(countries.value[0]);

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

const handleCountrySelection = (country) => {
    selectCountry(country);
    formData.value.phoneCountryCode = country.phone_code;
    validateField('phoneCountryCode');
    showCountryDropdown.value = false;
};
const hideDropdownOnFocusOut = (event) => {
    if (countryDropdownRef.value && !countryDropdownRef.value.contains(document.activeElement)) {
        showCountryDropdown.value = false;
    }
};

onMounted(() => {
    if (selectedCountry.value) {
        formData.value.phoneCountryCode = selectedCountry.value.phone_code;
    }
});

watch(selectedCountry, (newCountry) => {
    if (newCountry) {
        formData.value.phoneCountryCode = newCountry.phone_code;
    } else {
        formData.value.phoneCountryCode = '';
    }
    validateField('phoneCountryCode');
});
</script>

<template>
    <form @submit.prevent="submitLead" class="bg-gray-100 p-6 border-2 border-slate-900 text-left flex flex-col gap-4">
        <h2 class="text-2xl font-semibold text-left">Regístrate y recibe más información</h2>

        <div v-if="allErrorsList.length > 0"
            class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <ul class="list-disc list-inside">
                <li v-for="error in allErrorsList" :key="error">{{ error }}</li>
            </ul>
        </div>

        <div class="flex flex-col gap-2">
            <div class="text-left">
                <label for="name" class="block text-gray-700 text-sm font-bold mb-2 text-left">Nombre</label>
                <input id="name" v-model="formData.name" type="text" :class="{ 'border-red-500': errors.name }" class="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight text-left
                           bg-white autofill:bg-white
                           focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent"
                    @input="validateField('name')" />
            </div>

            <div class="text-left">
                <label for="email" class="block text-gray-700 text-sm font-bold mb-2 text-left">Correo
                    electrónico</label>
                <input id="email" v-model="formData.email" type="email" :class="{ 'border-red-500': errors.email }" class="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight text-left
                           bg-white autofill:bg-white
                           focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent"
                    @input="validateField('email'); serverError = null" />
            </div>

            <div class="flex gap-2 w-full">
                <div class="text-left flex flex-col w-full">
                    <label for="phone" class=" text-gray-700 text-sm font-bold mb-2 text-left">País</label>
                    <div class="flex flex-row gap-2 relative w-full" ref="countryDropdownRef"
                        @focusin="showCountryDropdown = true" @focusout="hideDropdownOnFocusOut">
                        <div class="relative w-full">
                            <input v-model="countryInputDisplay" :class="{ 'border-red-500': errors.phoneCountryCode }"
                                class="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight text-left bg-white focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent"
                                placeholder="País" />

                            <div v-if="showCountryDropdown || countrySearchQuery.length > 0"
                                class="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded shadow-lg max-h-48 overflow-y-auto">
                                <ul>
                                    <p v-for="country in filteredCountries" :key="country.code"
                                        @mousedown.prevent="handleCountrySelection(country)"
                                        class="cursor-pointer px-3 pt-0.5 hover:bg-gray-100 text-sm">
                                        {{ country.name }}
                                    </p>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="text-left w-full flex flex-col">
                    <label for="phone" class="block text-gray-700 text-sm font-bold mb-2 text-left">Número de
                        teléfono</label>
                    <input id="phone" v-model="formData.phone" type="tel" :class="{ 'border-red-500': errors.phone }"
                        class="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight text-left
                               bg-white autofill:bg-white
                               focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent"
                        @input="validateField('phone')" />
                </div>
            </div>
        </div>

        <button type="submit" :disabled="!isFormValid"
            :class="{ 'bg-slate-300 cursor-not-allowed': !isFormValid, 'bg-slate-800 hover:bg-slate-900': isFormValid }"
            class="text-white font-bold py-2 px-4 focus:outline-none focus:shadow-outline w-full text-left">
            Enviar
        </button>
    </form>
</template>