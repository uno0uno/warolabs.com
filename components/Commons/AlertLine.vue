<script setup>
import { defineProps, computed } from 'vue';

import {
    ExclamationCircleIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
    type: {
        type: String,
        default: 'error',
        validator: (value) => ['error', 'success', 'warning'].includes(value)
    }
});

const alertClasses = computed(() => {
    switch (props.type) {
        case 'success':
            return 'bg-green-100 text-green-700 border-green-500';
        case 'warning':
            return 'bg-yellow-100 text-yellow-700 border-yellow-500';
        case 'error':
        default:
            return 'bg-red-100 text-red-700 border-red-500';
    }
});

const alertIcon = computed(() => {
    switch (props.type) {
        case 'success':
            return CheckCircleIcon;
        case 'warning':
            return ExclamationTriangleIcon;
        case 'error':
        default:
            return ExclamationCircleIcon;
    }
});
</script>

<template>
    <div :class="alertClasses" class="p-2 font-medium text-sm rounded flex items-center gap-2">
        <component :is="alertIcon" class="h-5 w-5" aria-hidden="true" />
        <slot></slot>
    </div>
</template>