<template>
  <div class="mx-auto max-w-sm space-y-6">
    <!-- Verificando sesión existente -->
    <div v-if="checkingSession" class="text-center space-y-4">
      <div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      <p class="text-muted-foreground">Verificando sesión...</p>
    </div>

    <!-- Formulario de login -->
    <template v-else>
      <div class="space-y-2 text-center">
        <h1 class="text-3xl font-bold">Iniciar Sesión</h1>
        <p class="text-muted-foreground">
          Ingresa tu email para acceder a Warolabs
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="space-y-2">
        <label for="email" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Email
        </label>
        <UiInput
          id="email"
          v-model="email"
          type="email"
          placeholder="tu@email.com"
          required
          :disabled="loading"
          class="w-full"
        />
      </div>

      <UiButton 
        type="submit" 
        class="w-full" 
        :disabled="loading || !email"
      >
        <div v-if="loading" class="flex items-center gap-2">
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"></div>
          Enviando...
        </div>
        <span v-else>Enviar Magic Link</span>
      </UiButton>
    </form>

    <!-- Success Message -->
    <div v-if="success" class="rounded-lg bg-green-50 p-4 border border-green-200">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">
            ¡Magic link enviado!
          </p>
          <p class="text-sm text-green-700 mt-1">
            Revisa tu email ({{ email }}) y haz clic en el enlace para acceder.
          </p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="rounded-lg bg-red-50 p-4 border border-red-200">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800">Error al enviar magic link</p>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

      <div class="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta? Se creará automáticamente al iniciar sesión.
      </div>
    </template>
  </div>
</template>

<script setup>

const email = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')
const checkingSession = ref(true)

// Verificar si ya hay sesión al cargar el componente
onMounted(async () => {
  try {
    const session = await $fetch('/api/auth/session')
    if (session?.success && session?.user) {
      console.log('✅ User already authenticated, redirecting...')
      
      // Redirigir a la URL original si existe, sino al dashboard
      const route = useRoute()
      const redirectUrl = route.query.redirect || '/dashboard'
      await navigateTo(redirectUrl)
      return
    }
  } catch (error) {
    // No hay sesión válida, mostrar formulario
    console.log('ℹ️ No active session found, showing login form')
  } finally {
    checkingSession.value = false
  }
})

async function handleSubmit() {
  if (!email.value) return
  
  console.log('📧 Iniciando envío de magic link para:', email.value)
  loading.value = true
  success.value = false
  error.value = ''

  try {
    console.log('📨 Enviando magic link...')
    const response = await $fetch('/api/auth/sign-in-magic-link', {
      method: 'POST',
      body: {
        email: email.value
      }
    })
    console.log('✅ Resultado del magic link:', response)
    
    success.value = true
    console.log('🎉 Magic link enviado exitosamente')
  } catch (err) {
    console.error('❌ Error al enviar magic link:', err)
    console.error('❌ Error details:', {
      message: err.message,
      status: err.status,
      cause: err.cause
    })
    error.value = err.message || 'Error al enviar el magic link. Intenta nuevamente.'
  } finally {
    loading.value = false
  }
}

// Reset states when email changes
watch(email, () => {
  if (success.value || error.value) {
    success.value = false
    error.value = ''
  }
})
</script>