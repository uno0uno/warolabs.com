<template>
  <div :class="[
    'rounded-lg p-4 my-6 flex gap-4 items-start border',
    variantClasses[variant]
  ]">
    <div :class="['text-xl mt-0.5', iconColorClass]">
      {{ variantIcons[variant] }}
    </div>
    <div class="text-sm text-text-body flex-1">
      <p v-if="title" class="text-main font-semibold mb-1">{{ title }}</p>
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'warning', 'success', 'tip'].includes(value)
  },
  title: {
    type: String,
    default: ''
  }
})

const variantClasses = {
  info: 'bg-accent/5 border-accent/20',
  warning: 'bg-orange-500/5 border-orange-500/20',
  success: 'bg-green-500/5 border-green-500/20 border-l-4',
  tip: 'bg-blue-500/5 border-blue-500/20'
}

const variantIcons = {
  info: '💡',
  warning: '⚠️',
  success: '✅',
  tip: '💡'
}

const iconColorClass = computed(() => {
  const colors = {
    info: 'text-accent',
    warning: 'text-orange-500',
    success: 'text-green-500',
    tip: 'text-blue-500'
  }
  return colors[props.variant]
})
</script>
