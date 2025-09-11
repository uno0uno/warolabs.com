<template>
  <div class="border border-border rounded-md overflow-hidden">
    <!-- HTML Code Editor -->
    <div class="relative bg-slate-50 dark:bg-slate-900">
      <div class="flex">
        <!-- Line Numbers -->
        <div class="py-4 px-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-mono select-none border-r border-border">
          <div v-for="(line, index) in content.split('\n')" :key="index" class="leading-5">
            {{ String(index + 1).padStart(2, ' ') }}
          </div>
        </div>
        
        <!-- Code Textarea -->
        <textarea
          v-model="content"
          @input="updateContent"
          class="flex-1 p-4 bg-transparent text-sm font-mono border-0 resize-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-200"
          style="min-height: 300px; line-height: 1.25;"
          placeholder="Escribe tu HTML aquí..."
          spellcheck="false"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// State
const content = ref(props.modelValue)
const isUpdating = ref(false) // Flag to prevent circular updates

// Methods
const updateContent = () => {
  if (isUpdating.value) return
  
  isUpdating.value = true
  emit('update:modelValue', content.value)
  
  setTimeout(() => {
    isUpdating.value = false
  }, 0)
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (isUpdating.value) return
  
  console.log('📝 HTML Editor: modelValue changed:', newValue)
  
  // Update content exactly as received from endpoint
  isUpdating.value = true
  content.value = newValue || ''
  
  setTimeout(() => {
    isUpdating.value = false
  }, 50)
}, { immediate: true })
</script>

