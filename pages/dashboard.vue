<template>
  <div class="min-h-screen bg-background">
    <nav class="border-b border-border bg-card">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold">Warolabs Dashboard</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-muted-foreground">
              ¡Hola, {{ user?.email }}!
            </span>
            <UiButton @click="handleLogout" variant="outline" size="sm">
              Cerrar sesión
            </UiButton>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        
        <!-- Loading State -->
        <div v-if="loading" class="border-4 border-dashed border-border rounded-lg h-96 flex items-center justify-center">
          <div class="text-center space-y-4">
            <div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <h2 class="text-xl font-medium text-muted-foreground">
              Cargando tu dashboard...
            </h2>
          </div>
        </div>

        <!-- Dashboard Content -->
        <div v-else class="border-4 border-dashed border-border rounded-lg h-96 flex items-center justify-center">
          <div class="text-center space-y-4">
            <h2 class="text-3xl font-bold text-muted-foreground">
              🎉 ¡Bienvenido a Warolabs!
            </h2>
            <p class="text-muted-foreground">
              Has iniciado sesión exitosamente con Better Auth
            </p>
            <div v-if="user" class="space-y-2">
              <p class="text-sm">
                <strong>Email:</strong> {{ user.email }}
              </p>
              <p class="text-sm">
                <strong>ID:</strong> {{ user.id }}
              </p>
              <p class="text-sm">
                <strong>Nombre:</strong> {{ user.name || 'No especificado' }}
              </p>
            </div>
            <div v-else class="space-y-2">
              <p class="text-sm text-muted-foreground">
                Cargando información del usuario...
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'landingv2',
});

const { user, logout, getSession, loading } = useAuth()

const handleLogout = async () => {
  const result = await logout()
  if (result.success) {
    await navigateTo('/auth/logout')
  }
}

// Obtener sesión al montar el componente
onMounted(async () => {
  await getSession()
})
</script>