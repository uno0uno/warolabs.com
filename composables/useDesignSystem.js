/**
 * Composable para el sistema de diseño
 * Proporciona funciones de ayuda para usar clases de Tailwind de manera consistente
 */

export const useDesignSystem = () => {
  // Variantes de botones
  const buttonVariants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary', 
    success: 'btn-success',
    warning: 'btn-warning',
    destructive: 'btn-destructive',
    outline: 'btn-outline',
    ghost: 'btn-ghost'
  }

  // Tamaños de botones
  const buttonSizes = {
    sm: 'btn-sm',
    md: 'btn-md', 
    lg: 'btn-lg'
  }

  // Función para obtener clases de botón
  const getButtonClasses = (variant = 'primary', size = 'md') => {
    return `${buttonVariants[variant]} ${buttonSizes[size]}`
  }

  // Variantes de badges
  const badgeVariants = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success', 
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info'
  }

  // Badges específicos para engagement
  const engagementBadges = {
    'highly_engaged': 'badge-highly-engaged',
    'engaged': 'badge-engaged', 
    'interested': 'badge-interested',
    'cold': 'badge-cold'
  }

  // Función para obtener clases de engagement
  const getEngagementClasses = (level) => {
    return engagementBadges[level] || engagementBadges.cold
  }

  // Función para obtener clases de badge
  const getBadgeClasses = (variant = 'primary') => {
    return badgeVariants[variant] || badgeVariants.primary
  }

  // Clases de estados semánticos
  const statusClasses = {
    success: 'text-success-600',
    warning: 'text-warning-600', 
    error: 'text-destructive',
    info: 'text-info-600',
    neutral: 'text-muted-foreground'
  }

  // Función para obtener clases de estado
  const getStatusClasses = (status) => {
    return statusClasses[status] || statusClasses.neutral
  }

  // Clases de fondo para estados
  const backgroundClasses = {
    success: 'bg-emerald-50',
    warning: 'bg-amber-50',
    error: 'bg-red-50', 
    info: 'bg-cyan-50',
    primary: 'bg-purple-50',
    neutral: 'bg-muted'
  }

  // Función para obtener clases de fondo
  const getBackgroundClasses = (variant) => {
    return backgroundClasses[variant] || backgroundClasses.neutral
  }

  // Clases de iconos por contexto
  const iconClasses = {
    button: 'w-4 h-4',
    large: 'w-6 h-6',
    header: 'w-5 h-5',
    stat: 'w-8 h-8',
    empty: 'w-12 h-12'
  }

  // Función para obtener clases de icono
  const getIconClasses = (context = 'button') => {
    return iconClasses[context] || iconClasses.button
  }

  // Clases de transición comunes
  const transitionClasses = {
    default: 'transition-all duration-200',
    fast: 'transition-all duration-150',
    slow: 'transition-all duration-300',
    colors: 'transition-colors duration-200',
    transform: 'transition-transform duration-200'
  }

  // Función para obtener clases de transición
  const getTransitionClasses = (type = 'default') => {
    return transitionClasses[type] || transitionClasses.default
  }

  // Formatear números con separadores
  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-ES').format(number)
  }

  // Formatear fechas
  const formatDate = (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      ...options
    }
    return new Date(date).toLocaleDateString('es-ES', defaultOptions)
  }

  // Formatear porcentajes
  const formatPercentage = (value, decimals = 1) => {
    return `${Number(value).toFixed(decimals)}%`
  }

  // Clases de marca para colores negro y overlays
  const brandClasses = {
    black: 'brand-black',
    overlay: 'brand-overlay',
    loadingOverlay: 'loading-overlay',
    headerFooter: 'brand-header-footer'
  }

  // Función para obtener clases de marca
  const getBrandClasses = (type) => {
    return brandClasses[type] || brandClasses.black
  }

  return {
    // Funciones de clases
    getButtonClasses,
    getBadgeClasses,
    getEngagementClasses,
    getStatusClasses,
    getBackgroundClasses,
    getIconClasses,
    getTransitionClasses,
    getBrandClasses,
    
    // Objetos de clases
    buttonVariants,
    buttonSizes,
    badgeVariants,
    engagementBadges,
    statusClasses,
    backgroundClasses,
    iconClasses,
    transitionClasses,
    
    // Funciones de formateo
    formatNumber,
    formatDate,
    formatPercentage
  }
}