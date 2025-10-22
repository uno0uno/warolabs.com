import { getTenantContext } from '../utils/security/tenantIsolation';
import { readFileSync } from 'fs';
import { join } from 'path';

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
  '/api/landings/',       // Landing pages públicas
  '/api/tracking/',       // Email tracking endpoints (pixels, clicks)
  '/api/marketing/createLeadCampain', // Public lead capture
  '/api/marketing/verify-lead', // Lead verification endpoint
  '/api/profiles/',       // Public profile endpoints (ahora con filtro por tenant)
  '/api/events/',         // Events endpoints (tenant detection via headers)
  '/api/gamification/',   // Gamification endpoints (temporary for testing)
  '/api/admin/add-tenant-to-magic-tokens', // Database migration endpoint (temporary)
  '/api/dev/',            // Development endpoints for analysis
  '/api/_',               // Endpoints internos de Nuxt
];

// Endpoints que requieren verificación especial (solo superuser)
const SUPERUSER_ONLY_ENDPOINTS = [
  '/api/admin/',
  '/api/tenants/create',      // Solo la creación de tenants requiere superuser
  '/api/tenants/delete',      // Solo el borrado de tenants requiere superuser
  '/api/tenants/manage'       // Solo la gestión de tenants requiere superuser
];

// Endpoints de tenants permitidos para usuarios normales
const USER_TENANT_ENDPOINTS = [
  '/api/tenants/user-tenants',    // Listar tenants del usuario
  '/api/tenants/switch',          // Cambiar entre tenants del usuario
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
    return;
  }

  try {
    // Obtener contexto de tenant para todos los demás endpoints
    const tenantContext = await getTenantContext(event);
    
    // Detectar sitio actual para validar que coincida con el tenant de la sesión
    const host = getHeader(event, 'host') || '';
    const origin = getHeader(event, 'origin') || '';
    const referer = getHeader(event, 'referer') || '';
    let currentSite = 'warolabs.com'; // Default
    
    // En desarrollo, usar dev-site-mapping.json para detectar sitio correcto
    if (process.env.NODE_ENV === 'development') {
      try {
        // Load dev site mapping
        const devSiteMappingPath = join(process.cwd(), 'dev-site-mapping.json');
        const devSiteMapping = JSON.parse(readFileSync(devSiteMappingPath, 'utf8'));
        
        // Check origin first (from proxied requests)
        if (origin) {
          const url = new URL(origin);
          const hostWithPort = `${url.hostname}:${url.port}`;
          if (devSiteMapping[hostWithPort]) {
            currentSite = devSiteMapping[hostWithPort];
          }
        }
        // Check referer if origin not available
        else if (referer) {
          const url = new URL(referer);
          const hostWithPort = `${url.hostname}:${url.port}`;
          if (devSiteMapping[hostWithPort]) {
            currentSite = devSiteMapping[hostWithPort];
          }
        }
        // Check direct host (backend host)
        else if (host) {
          if (devSiteMapping[host]) {
            currentSite = devSiteMapping[host];
          }
        }
      } catch (error) {
      }
    } else {
      // En producción, usar lógica existente
      if (host.includes('warocol.com')) {
        currentSite = 'warocol.com';
      } else if (host.includes('warolabs.com')) {
        currentSite = 'warolabs.com';
      }
    }
    
    // Para requests de API, la validación del tenant se basa en la sesión, no en el sitio
    // warocol.com (dashboard multi-tenant) puede acceder a cualquier tenant a través del proxy
    // La restricción de tenant se maneja a nivel de datos, no a nivel de middleware
    // Solo aplicar restricción de sitio para endpoints no-API (páginas web directas)
    if (!tenantContext.is_superuser && !url.startsWith('/api/')) {
      if (currentSite === 'warolabs.com') {
        // Solo páginas web directas de warolabs.com requieren tenant WaroLabs
        const expectedTenantName = 'WaroLabs';
        if (tenantContext.tenant_name !== expectedTenantName) {
          throw createError({
            statusCode: 403,
            statusMessage: `Acceso denegado: Esta sesión no es válida para Warolabs`
          });
        }
      }
    }
    
    // Verificar endpoints que requieren superuser
    const requiresSuperuser = SUPERUSER_ONLY_ENDPOINTS.some(endpoint => url.startsWith(endpoint));
    if (requiresSuperuser && !tenantContext.is_superuser) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Este endpoint requiere permisos de superusuario'
      });
    }

    // Agregar contexto de tenant al event
    event.context.tenant = tenantContext;
    
    // Log de seguridad

  } catch (error) {
    
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