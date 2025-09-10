<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="w-full max-w-md p-6 text-center space-y-6">
      
      <!-- Loading State -->
      <div v-if="verifying" class="space-y-4">
        <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <h1 class="text-2xl font-bold">Verificando acceso...</h1>
        <p class="text-muted-foreground">
          Estamos validando tu magic link, espera un momento.
        </p>
      </div>

      <!-- Success State -->
      <div v-else-if="success" class="space-y-4">
        <div class="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-green-600">¡Acceso verificado!</h1>
        <p class="text-muted-foreground">
          Te estamos redirigiendo a tu dashboard...
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="space-y-4">
        <div class="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-red-600">Error de verificación</h1>
        <p class="text-muted-foreground">
          {{ error }}
        </p>
        <div class="space-y-2">
          <UiButton @click="$router.push('/auth/login')" class="w-full">
            Volver al login
          </UiButton>
          <UiButton @click="retry" variant="outline" class="w-full">
            Intentar nuevamente
          </UiButton>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { authClient } from '~/lib/auth-client'

definePageMeta({
  layout: 'landingv2'
});

const route = useRoute()
const router = useRouter()

const verifying = ref(true)
const success = ref(false)
const error = ref('')

async function verifyMagicLink() {
  try {
    verifying.value = true
    error.value = ''
    
    // Better Auth maneja automáticamente los query parameters del magic link
    const session = await authClient.getSession()
    
    if (session) {
      success.value = true
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } else {
      throw new Error('No se pudo establecer la sesión')
    }
    
  } catch (err) {
    console.error('Verification error:', err)
    error.value = err.message || 'Magic link inválido o expirado. Solicita uno nuevo.'
  } finally {
    verifying.value = false
  }
}

function retry() {
  verifyMagicLink()
}

// Verificar automáticamente al cargar la página
onMounted(() => {
  // Delay para mejor UX
  setTimeout(() => {
    verifyMagicLink()
  }, 1000)
})
</script>