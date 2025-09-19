export default defineNuxtRouteMiddleware((to, from) => {
  // Solo aplicar a la ruta exacta /marketing
  if (to.path === '/marketing') {
    console.log('🔄 Redirigiendo de /marketing a /marketing/cohorts')
    return navigateTo('/marketing/cohorts', { redirectCode: 301 })
  }
})