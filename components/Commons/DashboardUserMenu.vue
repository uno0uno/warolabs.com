<template>
  <div>
    <UiButton 
      v-if="user" 
      variant="ghost" 
      class="w-full h-auto p-2 hover:bg-accent justify-start"
      @click="toggleMenu"
    >
      <div class="flex items-center gap-3 w-full">
        <div class="w-8 h-8 bg-foreground flex items-center justify-center text-sm font-medium text-background">
          {{ getUserInitials(user) }}
        </div>
        <div class="flex-1 text-left">
          <div class="text-sm font-medium truncate">{{ user.name || 'Usuario' }}</div>
        </div>
        <Icon 
          name="heroicons:chevron-down" 
          class="w-4 h-4 text-muted-foreground transition-transform" 
          :class="{ 'rotate-180': isOpen }"
        />
      </div>
    </UiButton>
    
    <!-- Loading state -->
    <UiButton v-else variant="ghost" class="w-full h-auto p-2">
      <div class="flex items-center gap-3 w-full">
        <div class="w-8 h-8 rounded-full bg-muted-foreground animate-pulse"></div>
        <div class="flex-1 space-y-1">
          <div class="h-3 bg-muted-foreground animate-pulse rounded w-20"></div>
          <div class="h-2 bg-muted-foreground animate-pulse rounded w-16"></div>
        </div>
        <div class="w-4 h-4 bg-muted-foreground animate-pulse rounded"></div>
      </div>
    </UiButton>

    <!-- Dropdown menu -->
    <div 
      class="overflow-hidden transition-all duration-300"
      :style="{ maxHeight: isOpen && user ? '400px' : '0px' }"
    >
      <div v-if="user" class="mt-2 space-y-1 border-t border-border pt-2">
        <div class="space-y-1">
          <!-- Profile -->
          <div class="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded flex items-center gap-2">
            <Icon name="heroicons:user" class="w-4 h-4" />
            Perfil
          </div>

          <!-- Settings -->
          <div class="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded flex items-center gap-2">
            <Icon name="heroicons:cog-6-tooth" class="w-4 h-4" />
            Configuración
          </div>

          <!-- Theme toggle -->
          <div class="px-2 py-1.5 text-sm hover:bg-accent rounded flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Icon name="heroicons:moon" class="w-4 h-4" />
              Tema
            </div>
            <UiThemeToggle />
          </div>

          <!-- Logout -->
          <div class="border-t border-border pt-1 mt-2">
            <div 
              @click="handleLogout"
              class="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded text-destructive flex items-center gap-2"
            >
              <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4" />
              Cerrar sesión
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  user: Object
})

const emit = defineEmits(['logout', 'toggle'])

const isOpen = defineModel('isOpen', {
  type: Boolean,
  default: false
})

const getUserInitials = (user) => {
  if (!user) return '?'

  if (user.name) {
    return user.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (user.email) {
    return user.email.charAt(0).toUpperCase()
  }

  return '?'
}

const toggleMenu = () => {
  isOpen.value = !isOpen.value
  emit('toggle', isOpen.value)
}

const handleLogout = () => {
  emit('logout')
}
</script>