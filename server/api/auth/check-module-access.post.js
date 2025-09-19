import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { getCookie } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { module_slug } = body;

  if (!module_slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'module_slug es requerido'
    });
  }

  // Verificar sesión válida usando el token de la cookie
  const sessionToken = getCookie(event, 'session-token');
  
  if (!sessionToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token de sesión requerido'
    });
  }

  return await withPostgresClient(async (client) => {
    try {
      // Obtener usuario desde la sesión
      const sessionCheck = await client.query(`
        SELECT 
          s.user_id,
          p.email,
          p.name,
          tm.role,
          t.name as tenant_name
        FROM sessions s
        JOIN profile p ON s.user_id = p.id
        LEFT JOIN tenant_members tm ON p.id = tm.user_id
        LEFT JOIN tenants t ON tm.tenant_id = t.id
        WHERE s.id = $1 
          AND s.expires_at > NOW() 
          AND s.is_active = true
      `, [sessionToken]);

      if (sessionCheck.rows.length === 0) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Sesión inválida o expirada'
        });
      }

      const userInfo = sessionCheck.rows[0];
      const userId = userInfo.user_id;

      console.log(`🔍 Verificando acceso al módulo '${module_slug}' para usuario ${userInfo.email}`);

      // Actualizar actividad de la sesión
      await client.query(`
        UPDATE sessions 
        SET last_activity_at = NOW() 
        WHERE id = $1
      `, [sessionToken]);
      
      // Si es superuser, permitir acceso total
      if (userInfo.role === 'superuser') {
        console.log(`👑 Super usuario detectado - acceso total al módulo '${module_slug}'`);
        return {
          success: true,
          hasAccess: true,
          reason: 'Super usuario - acceso total',
          user_role: 'superuser',
          tenant_name: userInfo.tenant_name
        };
      }

      // Para usuarios regulares, verificar permisos del tenant
      const moduleAccessCheck = await client.query(`
        SELECT 
          t.name as tenant_name,
          m.name as module_name,
          m.slug as module_slug,
          tm.is_active,
          tm.contracted_at,
          tm.expires_at,
          CASE 
            WHEN tm.expires_at IS NULL OR tm.expires_at > NOW() THEN true
            ELSE false
          END as is_valid
        FROM tenant_members tmem
        JOIN tenants t ON tmem.tenant_id = t.id
        JOIN tenant_modules tm ON t.id = tm.tenant_id
        JOIN modules m ON tm.module_id = m.id
        WHERE tmem.user_id = $1 
          AND m.slug = $2
          AND tm.is_active = 'true'
          AND m.is_active = 'true'
      `, [userId, module_slug]);

      if (moduleAccessCheck.rows.length === 0) {
        console.log(`❌ Sin acceso al módulo '${module_slug}' - no está contratado para el tenant`);
        return {
          success: true,
          hasAccess: false,
          reason: `El módulo '${module_slug}' no está disponible para tu organización`,
          user_role: userInfo.role,
          tenant_name: userInfo.tenant_name
        };
      }

      const moduleAccess = moduleAccessCheck.rows[0];

      // Verificar si el módulo no ha expirado
      if (!moduleAccess.is_valid) {
        console.log(`⏰ Módulo '${module_slug}' expirado para el tenant`);
        return {
          success: true,
          hasAccess: false,
          reason: `El módulo '${module_slug}' ha expirado para tu organización`,
          user_role: userInfo.role,
          tenant_name: moduleAccess.tenant_name,
          expires_at: moduleAccess.expires_at
        };
      }

      console.log(`✅ Acceso permitido al módulo '${module_slug}' para tenant '${moduleAccess.tenant_name}'`);
      
      return {
        success: true,
        hasAccess: true,
        reason: `Acceso válido al módulo '${module_slug}'`,
        user_role: userInfo.role,
        tenant_name: moduleAccess.tenant_name,
        module_name: moduleAccess.module_name,
        contracted_at: moduleAccess.contracted_at,
        expires_at: moduleAccess.expires_at
      };

    } catch (error) {
      console.error('Error verificando acceso al módulo:', error);
      return {
        success: false,
        hasAccess: false,
        reason: 'Error interno verificando permisos',
        error: error.message
      };
    }
  }, event);
});