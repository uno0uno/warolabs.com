<template>
  <div>
    <!-- Header section matching mockup style -->
    <div class="border-b border-border bg-card">
      <div class="p-6 pb-4">
        <!-- Logo/Nav area like mockup -->
        <div class="flex justify-between items-center mb-6">
          <nav class="flex space-x-8">
            <NuxtLink to="/marketing/campaigns" :class="[
              $route.path === '/marketing/campaigns'
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground']"
              class="text-sm transition-colors">
              Campañas
            </NuxtLink>
            <NuxtLink to="/marketing/templates" :class="[
              $route.path.includes('/templates')
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground']"
              class="text-sm transition-colors">
              Templates
            </NuxtLink>
            <NuxtLink to="/marketing/lead-groups" :class="[
              $route.path.includes('/lead-groups')
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground']"
              class="text-sm transition-colors">
              Grupos
            </NuxtLink>
            <NuxtLink to="/marketing/sender" :class="[
              $route.path.includes('/sender')
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground']"
              class="text-sm transition-colors">
              Envío
            </NuxtLink>
            <NuxtLink to="/marketing/analytics" :class="[
              $route.path.includes('/analytics')
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground']"
              class="text-sm transition-colors">
              Analytics
            </NuxtLink>
          </nav>
          
          <!-- Right side actions like mockup -->
          <div class="flex items-center gap-4">
            <Icon name="heroicons:bell" class="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
            <Icon name="heroicons:question-mark-circle" class="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
            <Icon name="heroicons:user-circle" class="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <Transition enter-active-class="transition-all duration-400 ease-out"
      enter-from-class="opacity-0 transform translate-y-[-20px]" enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition-all duration-300 ease-in" leave-from-class="opacity-100 transform translate-y-0"
      leave-to-class="opacity-0 transform translate-y-[-20px]" mode="out-in">
      <NuxtPage />
    </Transition>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'marketing'
});

</script>