<!-- // layouts/marketing.vue -->
<template>
  <div class="flex h-screen bg-background text-foreground">
    
    <!-- Grid layout: sidebar + main content -->
    <div class="grid grid-cols-[240px_1fr] w-full">
        
        <!-- Sidebar (240px width like mockup) -->
        <aside class="bg-card p-6 border-r border-border flex flex-col justify-between">
          <!-- Header -->
          <div class="flex flex-col gap-4 h-full">
            <div class="flex flex-col gap-4">
              <!-- Brand -->
              <div class="flex items-center gap-3">
                <!-- Logo -->
                <div class="font-extrabold text-xl text-primary tracking-tight">Warolabs</div>
              </div>
              
              <!-- Search -->
              <div>
                <UiInput v-model="searchQuery" placeholder="Search by name, type or keyword" class="w-full bg-muted border-border text-sm" />
              </div>
              
              <!-- Filters Section (mimics mockup structure) -->
              <div class="flex flex-col gap-4">
                
                <!-- Show Section -->
                <CommonsDashboardCollapsibleSection 
                  title="Show" 
                  v-model:isOpen="marketingOpen"
                  :maxHeight="300"
                >
                  <nav class="flex flex-col gap-1">
                    <CommonsDashboardMenuItem
                      v-for="item in sectionItems"
                      :key="item.label"
                      :icon="item.icon"
                      :iconSolid="item.iconSolid"
                      :label="item.label"
                      :action="item.action"
                      :isSelected="selectedMarketingItem === 'Emails'"
                      type="navigation"
                      @action="handleMenuAction"
                    />
                  </nav>
                </CommonsDashboardCollapsibleSection>

                <!-- Status Section -->
                <CommonsDashboardCollapsibleSection 
                  title="Status" 
                  v-model:isOpen="favoritesOpen"
                  :maxHeight="200"
                >
                  <ul class="flex flex-col gap-1 text-sm">
                    <CommonsDashboardMenuItem
                      v-for="item in favoriteItems"
                      :key="item.label"
                      :icon="item.icon"
                      :label="item.label"
                      type="list"
                    />
                  </ul>
                </CommonsDashboardCollapsibleSection>
              </div>
            </div>
          </div>

          <!-- User Menu -->
          <div class="flex flex-col gap-6">
            <CommonsDashboardUserMenu 
              :user="user" 
              v-model:isOpen="userMenuOpen"
              @logout="handleLogout"
              @toggle="handleUserMenuToggle"
            />
          </div>
        </aside>

        <!-- Main content -->
        <main class="bg-background overflow-auto">
          <slot />
        </main>
        
      </div>
    
    <!-- Toast notifications -->
    <ClientOnly>
      <CommonsToastProvider />
    </ClientOnly>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useDashboardMenu } from '~/composables/useDashboardMenu'

const searchQuery = ref('')
const userMenuOpen = ref(false)
const favoritesOpen = ref(true)
const marketingOpen = ref(true)
const selectedMarketingItem = ref('Product')

// Get user data from auth composable
const { user, getSession, logout } = useAuth()

// Get menu items from composable
const { mainMenuItems, favoriteItems, sectionItems } = useDashboardMenu()

// Menu action handlers
const handleMenuAction = (action) => {
  if (action === 'navigateToEmails') {
    selectedMarketingItem.value = 'Emails'
    navigateTo('/marketing/campaigns')
  }
}

const handleUserMenuToggle = (isOpen) => {
  if (isOpen) {
    favoritesOpen.value = false
    marketingOpen.value = false
  } else {
    favoritesOpen.value = true
    marketingOpen.value = true
  }
}

const handleLogout = async () => {
  const result = await logout()
  if (result.success) {
    await navigateTo('/auth/logout')
  }
}

onMounted(async () => {
  await getSession()
})
</script>