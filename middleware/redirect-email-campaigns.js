export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path === '/dashboard/email-campaigns') {
    return navigateTo('/dashboard/email-campaigns/campaigns', { redirectCode: 301 })
  }
})