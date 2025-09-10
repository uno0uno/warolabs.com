<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="w-full max-w-md p-6 text-center space-y-6">
      
      <!-- Logging out State -->
      <div v-if="loggingOut" class="space-y-4">
        <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <h1 class="text-2xl font-bold">Cerrando sesión...</h1>
        <p class="text-muted-foreground">
          Te estamos desconectando de forma segura.
        </p>
      </div>

      <!-- Success State -->
      <div v-else class="space-y-4">
        <div class="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
          <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold">Sesión cerrada</h1>
        <p class="text-muted-foreground">
          Has cerrado sesión exitosamente. ¡Gracias por usar Warolabs!
        </p>
        <div class="space-y-2">
          <UiButton @click="$router.push('/')" class="w-full">
            Volver al inicio
          </UiButton>
          <UiButton @click="$router.push('/auth/login')" variant="outline" class="w-full">
            Iniciar sesión nuevamente
          </UiButton>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'landingv2'
});

const router = useRouter()
const loggingOut = ref(true)

async function handleLogout() {
  try {
    await $fetch('/api/auth/signout', { method: 'POST' })
    console.log('✅ Logout successful')
  } catch (err) {
    console.error('❌ Logout error:', err)
    // Continuar con logout local aunque falle el servidor
  } finally {
    loggingOut.value = false
    
    // Redirigir al home después de 3 segundos
    setTimeout(() => {
      router.push('/')
    }, 3000)
  }
}

// Ejecutar logout automáticamente al cargar la página
onMounted(() => {
  // Delay para mejor UX
  setTimeout(() => {
    handleLogout()
  }, 1500)
})
</script>