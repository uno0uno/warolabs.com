<template>
  <div>
    <UiButton 
      variant="ghost" 
      class="w-full justify-start p-0 h-auto text-xs text-muted-foreground mb-2"
      @click="isOpen = !isOpen"
    >
      <div class="flex items-center gap-2">
        <ChevronRightIconSolid 
          v-if="isOpen" 
          class="w-4 h-4 transition-transform text-black rotate-90" 
        />
        <ChevronRightIcon 
          v-else 
          class="w-4 h-4 transition-transform text-black" 
        />
        <p class="text-base font-bold">{{ title }}</p>
      </div>
    </UiButton>
    <div 
      class="overflow-hidden transition-all duration-300"
      :style="{ maxHeight: isOpen ? `${maxHeight}px` : '0px' }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ChevronRightIcon } from '@heroicons/vue/24/outline'
import { ChevronRightIcon as ChevronRightIconSolid } from '@heroicons/vue/24/solid'

defineProps({
  title: {
    type: String,
    required: true
  },
  maxHeight: {
    type: Number,
    default: 200
  }
})

const isOpen = defineModel('isOpen', {
  type: Boolean,
  default: true
})
</script>