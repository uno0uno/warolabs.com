export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip auth durante desarrollo si hay query param
  if (to.query.skipAuth === 'true') {
    return
  }

  // Definir patrones de rutas protegidas
  const protectedRoutePatterns = ['/marketing']
  const authRoutes = ['/auth/login', '/auth/logout', '/auth/verify']
  
  // Verificar si la ruta actual coincide con algún patrón protegido
  const isProtectedRoute = protectedRoutePatterns.some(pattern => to.path.startsWith(pattern))
  
  // Si no es una ruta protegida, permitir acceso
  if (!isProtectedRoute) {
    return
  }

  // Si estamos yendo a rutas de auth, permitir
  if (authRoutes.includes(to.path)) {
    return
  }

  // Verificar autenticación para rutas protegidas
  try {
    console.log(`🔍 Checking auth for protected route: ${to.path}`)
    
    // Verificar sesión actual
    const session = await $fetch('/api/auth/session')
    
    if (session?.success && session?.user) {
      console.log(`✅ Auth verified for user: ${session.user.email}`)
      return // Usuario autenticado, permitir acceso
    } else {
      console.log('❌ No valid session found')
      throw new Error('No session')
    }
    
  } catch (error) {
    console.log(`🚪 Redirecting to login: ${error.message}`)
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})