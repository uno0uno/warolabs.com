<template>
  <div class="mx-auto max-w-sm space-y-6 p-8 border-2 border-border bg-card shadow-card">
    <!-- Verificando sesión existente -->
    <div v-if="checkingSession" class="text-center space-y-4">
      <div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      <p class="text-muted-foreground">Verificando sesión...</p>
    </div>

    <!-- Formulario de login -->
    <div v-else-if="!emailSent" class="space-y-6">
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
          class="w-full brand-black" 
          :disabled="loading || !email"
        >
          <div v-if="loading" class="flex items-center gap-2">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"></div>
            Enviando...
          </div>
          <span v-else>Enviar Magic Link</span>
        </UiButton>
      </form>

      <div class="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta? Se creará automáticamente al iniciar sesión.
      </div>
    </div>

    <!-- Verification Code Section -->
    <div v-else-if="emailSent" class="space-y-4">
      <div class="text-center space-y-2">
        <h3 class="text-lg font-semibold">Código de Verificación</h3>
        <p class="text-sm text-muted-foreground">
          Revisa tu email ({{ email }}) y usa el código de 6 dígitos:
        </p>
      </div>
      
      <div class="space-y-3">
        <UiInput
          v-model="verificationCode"
          type="text"
          placeholder="123456"
          maxlength="6"
          class="text-center text-2xl tracking-widest font-mono"
          :disabled="verifyingCode"
          @keyup.enter="verifyCode"
        />
        
        <UiButton 
          @click="verifyCode" 
          :disabled="!verificationCode || verificationCode.length !== 6 || verifyingCode"
          class="w-full brand-black"
        >
          <div v-if="verifyingCode" class="flex items-center gap-2">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"></div>
            Verificando...
          </div>
          <span v-else>Verificar Código</span>
        </UiButton>
      </div>
      
      <div class="text-center">
        <p class="text-xs text-muted-foreground">
          ¿No recibiste el email? 
          <button 
            @click="emailSent = false; verificationCode = ''" 
            class="text-primary hover:underline"
            type="button"
          >
            Reenviar
          </button>
        </p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="rounded-lg bg-destructive/10 p-4 border border-destructive/20">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-destructive-foreground">Error al enviar magic link</p>
          <p class="text-sm text-destructive mt-1">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '~/composables/useToast'

const email = ref('')
const loading = ref(false)
const error = ref('')
const checkingSession = ref(true)
const emailSent = ref(false)
const verificationCode = ref('')
const verifyingCode = ref(false)
const toast = useToast()

// Verificar si ya hay sesión al cargar el componente
onMounted(async () => {
  try {
    const session = await $fetch('/api/auth/session')
    if (session?.success && session?.user) {
      console.log('✅ User already authenticated, redirecting...')
      
      // Redirigir a la URL original si existe, sino al dashboard
      const route = useRoute()
      const redirectUrl = route.query.redirect || '/marketing'
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
  error.value = ''

  try {
    console.log('📨 Enviando magic link...')
    const route = useRoute()
    const response = await $fetch('/api/auth/sign-in-magic-link', {
      method: 'POST',
      body: {
        email: email.value,
        redirect: route.query.redirect
      }
    })
    console.log('✅ Resultado del magic link:', response)
    
    // Mostrar toast de éxito y activar UI de código
    toast.success('Link de ingreso enviado')
    emailSent.value = true
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

async function verifyCode() {
  if (!verificationCode.value || verificationCode.value.length !== 6) {
    error.value = 'Ingresa un código de 6 dígitos'
    return
  }
  
  verifyingCode.value = true
  error.value = ''
  
  try {
    console.log(`🔢 Enviando código de verificación para: ${email.value}`)
    const response = await $fetch('/api/auth/verify-code', {
      method: 'POST',
      body: {
        email: email.value,
        code: verificationCode.value
      }
    })
    
    console.log('✅ Código verificado exitosamente:', response)
    toast.success('¡Acceso autorizado!')
    
    // Redirigir con recarga completa para asegurar que la cookie se incluya
    const route = useRoute()
    const redirectUrl = route.query.redirect || '/marketing'
    console.log(`🔄 Redirigiendo a: ${redirectUrl}`)
    
    // Agregar delay antes de redirección
    setTimeout(() => {
      console.log('🚀 Ejecutando redirección...')
      // Usar window.location para forzar recarga completa
      window.location.href = redirectUrl
    }, 1000)
    
  } catch (err) {
    console.error('❌ Error al verificar código:', err)
    error.value = err.message || 'Código inválido o expirado'
  } finally {
    verifyingCode.value = false
  }
}

// Reset error state when email or code changes
watch([email, verificationCode], () => {
  if (error.value) {
    error.value = ''
  }
})
</script>