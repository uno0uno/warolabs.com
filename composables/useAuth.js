import { authClient } from '~/lib/auth-client'

export const useAuth = () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  const loading = ref(true)

  // Obtener sesión actual
  const getSession = async () => {
    try {
      loading.value = true
      const session = await authClient.getSession()
      user.value = session?.user || null
      return session
    } catch (error) {
      console.error('Error getting session:', error)
      user.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  // Login con magic link
  const login = async (email) => {
    try {
      await authClient.signIn.magicLink({ email })
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.message || 'Error al enviar magic link' 
      }
    }
  }

  // Logout
  const logout = async () => {
    try {
      await authClient.signOut()
      user.value = null
      await navigateTo('/auth/logout')
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      user.value = null
      return { 
        success: false, 
        error: error.message || 'Error al cerrar sesión' 
      }
    }
  }

  // Verificar si el usuario tiene permisos
  const hasPermission = (permission) => {
    if (!user.value) return false
    // Implementar lógica de permisos aquí
    return true
  }

  // Requerir autenticación (para middleware)
  const requireAuth = async () => {
    const session = await getSession()
    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    return session
  }

  return {
    user: readonly(user),
    isAuthenticated,
    loading: readonly(loading),
    getSession,
    login,
    logout,
    hasPermission,
    requireAuth
  }
}