import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
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

      const user = sessionCheck.rows[0];
      const user_id = user.user_id;

      // Si es superuser, devolver todos los módulos
      if (user.role === 'superuser') {
        const allModules = await client.query(`
          SELECT id, name, description, slug, is_active
          FROM modules 
          WHERE is_active = 'true'
          ORDER BY name
        `);

        return {
          success: true,
          modules: allModules.rows,
          user_role: 'superuser',
          tenant_name: user.tenant_name
        };
      }

      // Para usuarios regulares, solo módulos contratados
      const userModules = await client.query(`
        SELECT 
          m.id,
          m.name,
          m.description,
          m.slug,
          m.is_active,
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
          AND tm.is_active = 'true'
          AND m.is_active = 'true'
        ORDER BY m.name
      `, [user_id]);

      // Filtrar solo módulos válidos (no expirados)
      const validModules = userModules.rows.filter(module => module.is_valid);

      return {
        success: true,
        modules: validModules,
        user_role: user.role,
        tenant_name: user.tenant_name,
        total_contracted: userModules.rows.length,
        total_valid: validModules.length
      };

    } catch (error) {
      console.error('Error obteniendo módulos del usuario:', error);
      return {
        success: false,
        modules: [],
        error: error.message
      };
    }
  }, event);
});