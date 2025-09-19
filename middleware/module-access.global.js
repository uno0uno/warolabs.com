export default defineNuxtRouteMiddleware(async (to, from) => {
  // Solo ejecutar en server-side donde podemos acceder a cookies HttpOnly
  if (process.client) return

  // Mapeo de rutas a módulos requeridos
  const routeModuleMap = {
    '/marketing': 'marketing',
    '/analytics': 'analytics', 
    '/crm': 'crm',
    '/admin': 'admin'
  }

  // Verificar si la ruta requiere un módulo específico
  const requiredModule = Object.entries(routeModuleMap).find(([route]) => 
    to.path.startsWith(route)
  )?.[1]

  // Si no requiere módulo específico, permitir acceso
  if (!requiredModule) return

  try {
    // Verificar que tengamos token de sesión (auth middleware debería haber corrido primero)
    const sessionToken = useCookie('session-token').value
    
    if (!sessionToken) {
      console.log('❌ No hay token de sesión - middleware de auth debería haber manejado esto')
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }

    console.log(`🔐 Verificando acceso al módulo '${requiredModule}' para ruta: ${to.path}`)

    // Verificar permisos del módulo usando token de sesión
    const hasAccess = await checkModuleAccess(requiredModule)

    if (!hasAccess) {
      console.log(`❌ Acceso denegado al módulo '${requiredModule}' para ruta: ${to.path}`)
      
      // Redirigir a página de error de acceso con información del módulo
      return navigateTo(`/error/module-access?module=${requiredModule}`)
    }

    console.log(`✅ Acceso permitido al módulo '${requiredModule}' para ruta: ${to.path}`)

  } catch (error) {
    console.error('Error verificando acceso al módulo:', error)
    
    // Si es error de autenticación, redirigir a login
    if (error.statusCode === 401) {
      console.log('❌ Error 401 - redirigiendo a login')
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
    
    // Para otros errores, redirigir a página de error
    console.log(`❌ Error verificando módulo: ${error.message}`)
    return navigateTo(`/error/module-access?module=${requiredModule}&error=verification`)
  }
})

// Función helper para verificar acceso al módulo usando token de sesión
async function checkModuleAccess(moduleSlug) {
  try {
    // Verificar si el tenant del usuario tiene acceso al módulo
    const response = await $fetch('/api/auth/check-module-access', {
      method: 'POST',
      body: {
        module_slug: moduleSlug
      }
    })

    return response.success && response.hasAccess

  } catch (error) {
    console.error('Error checking module access:', error)
    
    // Si es error 401, es problema de autenticación
    if (error.statusCode === 401) {
      return false
    }
    
    // Para otros errores, denegar acceso por seguridad
    return false
  }
}