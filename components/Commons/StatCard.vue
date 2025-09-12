<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center">
      <div :class="[
        'p-2 rounded-lg',
        colorClass
      ]">
        <div :class="[
          'w-6 h-6 rounded',
          iconColorClass
        ]"></div>
      </div>
      <div class="ml-4">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ value }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">{{ label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  value: {
    type: [String, Number],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'purple', 'orange', 'red'].includes(value)
  }
});

const colorClass = computed(() => {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900',
    green: 'bg-green-100 dark:bg-green-900',
    purple: 'bg-purple-100 dark:bg-purple-900',
    orange: 'bg-orange-100 dark:bg-orange-900',
    red: 'bg-red-100 dark:bg-red-900'
  };
  return colors[props.color];
});

const iconColorClass = computed(() => {
  const colors = {
    blue: 'bg-blue-600 dark:bg-blue-400',
    green: 'bg-green-600 dark:bg-green-400',
    purple: 'bg-purple-600 dark:bg-purple-400',
    orange: 'bg-orange-600 dark:bg-orange-400',
    red: 'bg-red-600 dark:bg-red-400'
  };
  return colors[props.color];
});
</script>