export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path === '/email-campaigns') {
    return navigateTo('/marketing/campaigns', { redirectCode: 301 })
  }
})