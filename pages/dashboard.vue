<template>
    <!-- Main content -->
    <div class="flex-1 bg-background p-6 overflow-auto">
      <div v-if="loading" class="flex items-center justify-center h-96">
        <UiCard class="w-full max-w-md">
          <UiCardContent class="flex flex-col items-center justify-center p-8 space-y-4">
            <div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <h2 class="text-xl font-medium text-muted-foreground">
              Cargando tu dashboard...
            </h2>
          </UiCardContent>
        </UiCard>
      </div>

      <div v-else class="space-y-6">
        <!-- Stats Cards -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <UiCard>
            <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <UiCardTitle class="text-sm font-medium">Proyectos</UiCardTitle>
              <svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </UiCardHeader>
            <UiCardContent>
              <div class="text-2xl font-bold">12</div>
              <p class="text-xs text-muted-foreground">+2 desde el mes pasado</p>
            </UiCardContent>
          </UiCard>

          <UiCard>
            <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <UiCardTitle class="text-sm font-medium">Usuarios</UiCardTitle>
              <svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </UiCardHeader>
            <UiCardContent>
              <div class="text-2xl font-bold">+573</div>
              <p class="text-xs text-muted-foreground">+10% desde el mes pasado</p>
            </UiCardContent>
          </UiCard>

          <UiCard>
            <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <UiCardTitle class="text-sm font-medium">Ventas</UiCardTitle>
              <svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
              </svg>
            </UiCardHeader>
            <UiCardContent>
              <div class="text-2xl font-bold">+$12,234</div>
              <p class="text-xs text-muted-foreground">+19% desde el mes pasado</p>
            </UiCardContent>
          </UiCard>

          <UiCard>
            <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <UiCardTitle class="text-sm font-medium">Conversiones</UiCardTitle>
              <svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </UiCardHeader>
            <UiCardContent>
              <div class="text-2xl font-bold">+89</div>
              <p class="text-xs text-muted-foreground">+201 desde la semana pasada</p>
            </UiCardContent>
          </UiCard>
        </div>
      </div>
    </div>
</template>

<script setup>
import { HomeIcon, UserGroupIcon, ClockIcon, CurrencyDollarIcon, DocumentTextIcon, StarIcon, Cog8ToothIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'dashboard',
});

const handleLogout = async () => {
  const result = await logout()
  if (result.success) {
    await navigateTo('/auth/logout')
  }
}

</script>
