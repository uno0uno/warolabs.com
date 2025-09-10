<!-- // layouts/dashboard.vue -->
<template>
  <div class="flex h-screen bg-background text-foreground">
    <!-- Sidebar -->
    <aside class="w-72 bg-card p-4 flex flex-col justify-between border-r border-border">
      <!-- Header -->
      <div class="flex flex-col gap-2 justify-between h-full py-2">
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-md bg-foreground flex items-center justify-center font-bold text-background">W</div>
            <div>
              <div class="font-semibold">Warolabs</div>
              <div class="text-xs text-muted-foreground">warolabs</div>
            </div>
          </div>
          <!-- Search -->
          <div>
            <UiInput v-model="searchQuery" placeholder="Search here" class="w-full bg-muted border-border" />
          </div>

          <!-- Menu principal -->
          <div>
            <nav class="grid grid-cols-2 gap-2">
            <UiButton variant="ghost" class="flex flex-col h-auto p-3 border-2 border-border hover:bg-accent">
              <div class="flex flex-col items-center gap-1">
                <HomeIcon class="w-7 h-7" />
                <span class="text-xs">Dashboard</span>
              </div>
            </UiButton>
              <UiButton variant="ghost" size="sm" class="flex flex-col h-auto p-3 border-2 border-border hover:bg-accent">
                <div class="flex flex-col items-center gap-1">
                  <UserGroupIcon  class="w-7 h-7"  />
                  <span class="text-xs">Employees</span>
                </div>
              </UiButton>
              <UiButton variant="ghost" size="sm" class="flex flex-col h-auto p-3 border-2 border-border hover:bg-accent">
                <div class="flex flex-col items-center gap-1">
                  <ClockIcon  class="w-7 h-7"  />
                  <span class="text-xs">Time</span>
                </div>
              </UiButton>
              <UiButton variant="ghost" size="sm" class="flex flex-col h-auto p-3 border-2 border-border hover:bg-accent">
                <div class="flex flex-col items-center gap-1">
                  <CurrencyDollarIcon  class="w-7 h-7" />
                  <span class="text-xs">Finance</span>
                </div>

              </UiButton>
            </nav>
          </div>

          <!-- Favorites -->
          <div>
            <UiButton variant="ghost" class="w-full justify-start p-0 h-auto text-xs text-muted-foreground mb-2" @click="favoritesOpen = !favoritesOpen">
              <div class="flex items-center gap-2">
                <ChevronRightIconSolid v-if="favoritesOpen" class="w-4 h-4 transition-transform text-black rotate-90" />
                <ChevronRightIcon v-else class="w-4 h-4 transition-transform text-black" />
                <p class="text-base font-bold">Favorite</p>
              </div>
            </UiButton>
            <div class="overflow-hidden transition-all duration-300" :style="{ maxHeight: favoritesOpen ? '200px' : '0px' }">
              <ul class="flex flex-col gap-2 text-sm">
                <li class="flex items-center gap-2 cursor-pointer hover:text-foreground text-muted-foreground">
                  <HashtagIcon class="w-4 h-4" /> Opportunity Stages
                </li>
                <li class="flex items-center gap-2 cursor-pointer hover:text-foreground text-muted-foreground">
                  <HashtagIcon class="w-4 h-4" /> Key Metrics
                </li>
                <li class="flex items-center gap-2 cursor-pointer hover:text-foreground text-muted-foreground">
                  <HashtagIcon class="w-4 h-4" /> Product Plan
                </li>
              </ul>
            </div>
          </div>

          <!-- Marketing -->      
          <div>
            <UiButton variant="ghost" class="w-full justify-start p-0 h-auto text-xs text-muted-foreground mb-2" @click="marketingOpen = !marketingOpen">
              <div class="flex items-center gap-2">
                <ChevronRightIconSolid v-if="marketingOpen" class="w-4 h-4 transition-transform text-black rotate-90" />
                <ChevronRightIcon v-else class="w-4 h-4 transition-transform text-black" />
                <p class="text-base font-bold">Marketing</p>
              </div>
            </UiButton>
            <div class="overflow-hidden transition-all duration-300" :style="{ maxHeight: marketingOpen ? '300px' : '0px' }">
              <nav class="flex flex-col gap-2">
                <UiButton variant="ghost" class="justify-start px-3 py-2 h-auto border-2 border-border hover:bg-accent" @click="selectedMarketingItem = 'Product'">
                  <MagnifyingGlassIconSolid v-if="selectedMarketingItem === 'Product'" class="w-5 h-5 mr-2" />
                  <MagnifyingGlassIcon v-else class="w-5 h-5 mr-2" />
                  Product
                </UiButton>
                <UiButton variant="ghost" class="justify-start px-3 py-2 h-auto border-2 border-border hover:bg-accent" @click="selectedMarketingItem = 'Emails'">
                  <EnvelopeIconSolid v-if="selectedMarketingItem === 'Emails'" class="w-5 h-5 mr-2" />
                  <EnvelopeIcon v-else class="w-5 h-5 mr-2" />
                  Emails
                </UiButton>
                <UiButton variant="ghost" class="justify-start px-3 py-2 h-auto border-2 border-border hover:bg-accent" @click="selectedMarketingItem = 'Integration'">
                  <LinkIconSolid v-if="selectedMarketingItem === 'Integration'" class="w-5 h-5 mr-2" />
                  <LinkIcon v-else class="w-5 h-5 mr-2" />
                  Integration
                </UiButton>
                <UiButton variant="ghost" class="justify-start px-3 py-2 h-auto border-2 border-border hover:bg-accent" @click="selectedMarketingItem = 'Widget'">
                  <Cog6ToothIconSolid v-if="selectedMarketingItem === 'Widget'" class="w-5 h-5 mr-2" />
                  <Cog6ToothIcon v-else class="w-5 h-5 mr-2" />
                  Widget
                </UiButton>
                <UiButton variant="ghost" class="justify-start px-3 py-2 h-auto border-2 border-border hover:bg-accent" @click="selectedMarketingItem = 'Task'">
                  <ClipboardDocumentCheckIconSolid v-if="selectedMarketingItem === 'Task'" class="w-5 h-5 mr-2" />
                  <ClipboardDocumentCheckIcon v-else class="w-5 h-5 mr-2" />
                  Task
                </UiButton>
              </nav>
            </div>
          </div>
        </div>
      </div>

       <div class="flex flex-col gap-6">

        <!-- Footer user -->
        <div>
          <UiButton v-if="user" variant="ghost" class="w-full h-auto p-2 hover:bg-accent justify-start" @click="toggleUserMenu">
            <div class="flex items-center gap-3 w-full">
              <div
                class="w-8 h-8 bg-foreground flex items-center justify-center text-sm font-medium text-background">
                {{ getUserInitials(user) }}
              </div>
              <div class="flex-1 text-left">
                <div class="text-sm font-medium truncate">{{ user.name || 'Usuario' }}</div>
              </div>
              <svg class="w-4 h-4 text-muted-foreground transition-transform" :class="{ 'rotate-180': userMenuOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </UiButton>
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

          <div class="overflow-hidden transition-all duration-300" :style="{ maxHeight: userMenuOpen && user ? '400px' : '0px' }">
            <div v-if="user" class="mt-2 space-y-1 border-t border-border pt-2">

            <div class="space-y-1">
              <div class="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Perfil
              </div>

              <div class="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                  </path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Configuración
              </div>

              <div class="px-2 py-1.5 text-sm hover:bg-accent rounded-sm flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z">
                    </path>
                  </svg>
                  Tema
                </div>
                <UiThemeToggle />
              </div>

              <div class="border-t border-border pt-1 mt-2">
                <div @click="handleLogout"
                  class="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm text-destructive flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                    </path>
                  </svg>
                  Cerrar sesión
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
       </div>

    </aside>

    <!-- Main content -->
    <main class="flex-1 bg-background p-6 overflow-auto">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { HomeIcon, UserGroupIcon, ClockIcon, CurrencyDollarIcon, DocumentTextIcon, StarIcon, HashtagIcon, MagnifyingGlassIcon, EnvelopeIcon, LinkIcon, Cog6ToothIcon, ClipboardDocumentCheckIcon, Cog8ToothIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { ChevronRightIcon as ChevronRightIconSolid, MagnifyingGlassIcon as MagnifyingGlassIconSolid, EnvelopeIcon as EnvelopeIconSolid, LinkIcon as LinkIconSolid, Cog6ToothIcon as Cog6ToothIconSolid, ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconSolid } from '@heroicons/vue/24/solid'

const searchQuery = ref('')
const userMenuOpen = ref(false)
const favoritesOpen = ref(true)
const marketingOpen = ref(true)
const selectedMarketingItem = ref('Product')

// Get user data from auth composable
const { user, getSession, logout } = useAuth()

// Function to get user initials for avatar
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

// Handle user menu toggle and minimize others
const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
  if (userMenuOpen.value) {
    favoritesOpen.value = false
    marketingOpen.value = false
  } else {
    // Reabrir acordeones cuando se cierra el menú de usuario
    favoritesOpen.value = true
    marketingOpen.value = true
  }
}

// Handle logout
const handleLogout = async () => {
  const result = await logout()
  if (result.success) {
    await navigateTo('/auth/logout')
  }
}

// Initialize user session
onMounted(async () => {
  await getSession()
})
</script>