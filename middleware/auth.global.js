export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip auth durante desarrollo si hay query param
  if (to.query.skipAuth === 'true') {
    return
  }

  // Definir rutas protegidas específicamente
  const protectedRoutes = ['/marketing']
  const authRoutes = ['/auth/login', '/auth/logout', '/auth/verify']
  
  // Si no es una ruta protegida, permitir acceso
  if (!protectedRoutes.includes(to.path)) {
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