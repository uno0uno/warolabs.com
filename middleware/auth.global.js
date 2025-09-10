export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip auth durante desarrollo si hay query param
  if (to.query.skipAuth === 'true') {
    return
  }

  // Definir rutas protegidas específicamente
  const protectedRoutes = ['/dashboard']
  const authRoutes = ['/auth/login', '/auth/logout', '/auth/verify']
  
  // Si no es una ruta protegida, permitir acceso
  if (!protectedRoutes.includes(to.path)) {
    return
  }

  // Si estamos yendo a login desde una ruta protegida, permitir
  if (to.path === '/auth/login') {
    return
  }

  // Solo redirigir en rutas protegidas sin sesión
  console.log(`Checking auth for protected route: ${to.path}`)
  return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
})