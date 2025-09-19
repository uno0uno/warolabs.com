<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="max-w-md w-full text-center">
      <!-- Error Icon -->
      <div class="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <Icon name="heroicons:lock-closed" class="w-12 h-12 text-red-600" />
      </div>
      
      <!-- Error Title -->
      <h1 class="text-2xl font-bold text-foreground mb-4">
        Acceso Restringido
      </h1>
      
      <!-- Error Message -->
      <p class="text-muted-foreground mb-6 leading-relaxed">
        No tienes acceso a este módulo. Tu organización no tiene contratado este servicio o tus permisos no incluyen esta funcionalidad.
      </p>
      
      <!-- Module Info -->
      <div v-if="moduleInfo" class="bg-muted p-4 rounded-lg mb-6 text-left">
        <h3 class="font-medium text-foreground mb-2">Información del Módulo</h3>
        <div class="space-y-1 text-sm text-muted-foreground">
          <p><strong>Módulo:</strong> {{ moduleInfo.name }}</p>
          <p><strong>Tu organización:</strong> {{ userInfo?.tenant_name || 'No identificada' }}</p>
          <p><strong>Tu rol:</strong> {{ userInfo?.role || 'No identificado' }}</p>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="space-y-3">
        <button 
          @click="goBack" 
          class="btn-primary w-full"
        >
          Volver Atrás
        </button>
        
        <button 
          @click="goHome" 
          class="btn-secondary w-full"
        >
          Ir al Inicio
        </button>
        
        <button 
          @click="contactAdmin" 
          class="text-sm text-primary hover:underline"
        >
          Contactar Administrador
        </button>
      </div>
      
      <!-- Available Modules -->
      <div v-if="availableModules?.length" class="mt-8 text-left">
        <h4 class="font-medium text-foreground mb-3">Módulos Disponibles</h4>
        <div class="grid grid-cols-1 gap-2">
          <NuxtLink 
            v-for="module in availableModules"
            :key="module.slug"
            :to="`/${module.slug}`"
            class="p-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <div class="font-medium text-sm">{{ module.name }}</div>
            <div class="text-xs text-muted-foreground">{{ module.description }}</div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Props desde la URL o error
const route = useRoute()
const moduleInfo = ref(null)
const userInfo = ref(null)
const availableModules = ref([])

// Métodos de navegación
const goBack = () => {
  window.history.back()
}

const goHome = () => {
  navigateTo('/')
}

const contactAdmin = () => {
  // TODO: Implementar contacto con admin
  alert('Funcionalidad de contacto en desarrollo')
}

// Cargar información del error y módulos disponibles
onMounted(async () => {
  try {
    // Obtener información del usuario si está disponible
    const { user } = useAuth()
    if (user.value) {
      userInfo.value = user.value
      
      // Cargar módulos disponibles para este usuario
      const response = await $fetch('/api/auth/user-modules', {
        method: 'POST',
        body: { user_id: user.value.id }
      })
      
      if (response.success) {
        availableModules.value = response.modules
      }
    }
    
    // Información del módulo desde query params
    if (route.query.module) {
      moduleInfo.value = {
        name: route.query.module.toUpperCase(),
        slug: route.query.module
      }
    }
    
  } catch (error) {
    console.error('Error cargando información de acceso:', error)
  }
})

// Meta para SEO
definePageMeta({
  layout: false,
  title: 'Acceso Restringido'
})
</script>