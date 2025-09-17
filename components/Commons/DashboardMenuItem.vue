<template>
  <UiButton 
    :variant="variant" 
    :size="size"
    :class="buttonClass"
    @click="handleClick"
  >
    <div class="flex flex-col items-start gap-1" v-if="isMainMenu">
      <Component :is="iconComponent" class="w-7 h-7" />
      <span class="text-xs">{{ label }}</span>
    </div>
    <div v-else-if="isNavigation" class="flex items-center">
      <Component 
        :is="isSelected ? iconSolidComponent : iconComponent" 
        class="w-5 h-5 mr-2" 
      />
      {{ label }}
    </div>
    <div v-else class="flex items-center gap-2">
      <Component :is="iconComponent" class="w-4 h-4" />
      {{ label }}
    </div>
  </UiButton>
</template>

<script setup>
import { computed } from 'vue'
import * as HeroiconsOutline from '@heroicons/vue/24/outline'
import * as HeroiconsSolid from '@heroicons/vue/24/solid'

const props = defineProps({
  icon: String,
  iconSolid: String,
  label: String,
  route: String,
  action: String,
  isSelected: Boolean,
  variant: {
    type: String,
    default: 'ghost'
  },
  size: String,
  type: {
    type: String,
    default: 'default' // 'main', 'navigation', 'list'
  }
})

const emit = defineEmits(['action'])

const iconComponent = computed(() => {
  return HeroiconsOutline[props.icon]
})

const iconSolidComponent = computed(() => {
  return HeroiconsSolid[props.iconSolid]
})

const isMainMenu = computed(() => props.type === 'main')
const isNavigation = computed(() => props.type === 'navigation')

const buttonClass = computed(() => {
  const base = {
    main: 'sidebar-menu-main',
    navigation: 'sidebar-menu-navigation',
    list: 'sidebar-menu-list'
  }
  return base[props.type] || ''
})

const handleClick = () => {
  if (props.route) {
    navigateTo(props.route)
  } else if (props.action) {
    emit('action', props.action)
  }
}
</script>