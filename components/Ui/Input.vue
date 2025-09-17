<template>
  <input
    :class="cn(
      'flex h-9 w-full border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      $attrs.class
    )"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    v-bind="$attrs"
  />
</template>

<script setup>
import { cn } from "~/lib/utils"

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])
</script>