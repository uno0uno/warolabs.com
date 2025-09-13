<template>
  <div class="toast-card rounded-md border border-gray-300 bg-white p-4 shadow-sm">
    <div class="flex items-center gap-4">
      <!-- Icon -->
      <div class="flex-shrink-0">
        <CheckCircleIcon 
          v-if="type === 'success'" 
          class="w-6 h-6 text-green-600" 
        />
        <XCircleIcon 
          v-else-if="type === 'error'" 
          class="w-6 h-6 text-red-600" 
        />
        <ExclamationTriangleIcon 
          v-else-if="type === 'warning'" 
          class="w-6 h-6 text-yellow-600" 
        />
        <InformationCircleIcon 
          v-else-if="type === 'info'" 
          class="w-6 h-6 text-blue-600" 
        />
        <ArrowPathIcon 
          v-else-if="type === 'loading'" 
          class="w-6 h-6 text-gray-500 animate-spin" 
        />
      </div>

      <!-- Content -->
      <div class="flex-1">
        <strong class="font-medium text-gray-900">{{ title }}</strong>
      </div>

      <!-- Close button -->
      <button
        @click="closeToast"
        class="-m-3 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
        type="button"
        aria-label="Dismiss alert"
      >
        <span class="sr-only">Dismiss popup</span>
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { toast } from 'vue-sonner'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  ArrowPathIcon, 
  XMarkIcon 
} from '@heroicons/vue/24/solid'

const props = defineProps({
  toastId: {
    type: [String, Number],
    required: true,
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info', 'loading'].includes(value)
  },
  title: {
    type: String,
    required: true,
  }
})

function closeToast() {
  toast.dismiss(props.toastId)
}
</script>

<style scoped>
.toast-card {
  animation: slideInFromRight 0.3s ease-out;
}

@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Animación de salida controlada por vue-sonner */
[data-state="closed"] .toast-card {
  animation: slideOutToRight 0.3s ease-in;
}

@keyframes slideOutToRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>