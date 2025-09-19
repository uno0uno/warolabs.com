import { getTenantContext } from '../utils/security/tenantIsolation';

/**
 * Middleware global para proteger todos los endpoints de API con aislamiento de tenant
 */

// Endpoints que están exentos de verificación de tenant (públicos o de autenticación)
const EXEMPT_ENDPOINTS = [
  '/api/auth/sign-in-magic-link',
  '/api/auth/verify',
  '/api/auth/session',
  '/api/auth/signout',
  '/api/auth/get-token',  // Token JWT para landing pages
  '/api/utils/',          // Utilities endpoints (encryption, etc.)
  '/api/landings/',       // Landing pages públicas
  '/api/tracking/',       // Email tracking endpoints (pixels, clicks)
  '/api/marketing/createLeadCampain', // Public lead capture
  '/api/debug/',          // Endpoints de debug (desarrollo)
  '/api/migration/',      // Endpoints de migración de base de datos
  '/api/_',               // Endpoints internos de Nuxt
];

// Endpoints que requieren verificación especial (solo superuser)
const SUPERUSER_ONLY_ENDPOINTS = [
  '/api/admin/',
  '/api/tenants/',
  '/api/debug/analyze-tenants',
  '/api/debug/setup-modules'
];

export default defineEventHandler(async (event) => {
  // Solo aplicar a rutas de API
  if (!event.node.req.url?.startsWith('/api/')) {
    return;
  }

  const url = event.node.req.url;
  
  // Verificar si el endpoint está exento
  const isExempt = EXEMPT_ENDPOINTS.some(exempt => url.startsWith(exempt));
  if (isExempt) {
    console.log(`🔓 Endpoint exento de verificación de tenant: ${url}`);
    return;
  }

  try {
    // Obtener contexto de tenant para todos los demás endpoints
    const tenantContext = await getTenantContext(event);
    
    // Verificar endpoints que requieren superuser
    const requiresSuperuser = SUPERUSER_ONLY_ENDPOINTS.some(endpoint => url.startsWith(endpoint));
    if (requiresSuperuser && !tenantContext.is_superuser) {
      console.log(`❌ Acceso denegado a endpoint de superuser: ${url} para usuario: ${tenantContext.email}`);
      throw createError({
        statusCode: 403,
        statusMessage: 'Este endpoint requiere permisos de superusuario'
      });
    }

    // Agregar contexto de tenant al event
    event.context.tenant = tenantContext;
    
    // Log de seguridad
    console.log(`🔐 Endpoint protegido: ${url} | Tenant: ${tenantContext.tenant_name} | Usuario: ${tenantContext.email} | Superuser: ${tenantContext.is_superuser}`);

  } catch (error) {
    console.error(`🚨 Error de seguridad en endpoint ${url}:`, error.message);
    
    // Re-throw errores de autenticación/autorización
    if (error.statusCode === 401 || error.statusCode === 403) {
      throw error;
    }
    
    // Para otros errores, denegar acceso por seguridad
    throw createError({
      statusCode: 500,
      statusMessage: 'Error de verificación de seguridad'
    });
  }
});