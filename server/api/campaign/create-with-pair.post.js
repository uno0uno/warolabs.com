import { defineEventHandler, readBody } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log('🎯 [API] Received request to create campaign with template pair. Body:', body);

    const {
      campaign_name,
      pair_id,
      profile_id
    } = body;

    // 1. Validación de campos obligatorios.
    if (!campaign_name || !pair_id || !profile_id) {
      // Establecer código de estado de error en la respuesta
      event.node.res.statusCode = 400; // Bad Request
      return {
        success: false,
        message: 'Faltan campos obligatorios: campaign_name, pair_id, profile_id'
      };
    }

    // 2. Ejecutar la función de base de datos en una sola llamada.
    // La función 'create_campaign_from_pair' se encarga de toda la lógica:
    // - Verificar el par de plantillas.
    // - Generar un slug único.
    // - Crear la campaña.
    // - Asociar las plantillas.
    // - Devolver el objeto completo de la campaña.
    // Todo esto ocurre en una única transacción atómica dentro de la función.
    const result = await withPostgresClient(async (client) => {
      const { rows } = await client.query(
        'SELECT create_campaign_from_pair($1, $2, $3) as campaign',
        [profile_id, campaign_name, pair_id]
      );
      
      // La función devuelve el objeto JSON de la campaña en la primera fila.
      if (!rows[0] || !rows[0].campaign) {
        throw new Error('La función de la base de datos no devolvió una campaña.');
      }

      return rows[0].campaign;
    });

    console.log('✅ [API] Campaign created successfully with DB function. Result:', result);

    // 3. Devolver la respuesta exitosa.
    return {
      success: true,
      data: result,
      message: 'Campaña creada exitosamente con template pair'
    };

  } catch (error) {
    // El bloque catch ahora captura tanto los errores de la aplicación como los errores
    // que la función de PostgreSQL pueda lanzar (ej. si el par de templates no es válido).
    console.error('❌ [API] Error creating campaign with template pair:', error);
    
    // Establecer código de estado de error en la respuesta
    event.node.res.statusCode = 500; // Internal Server Error
    return {
      success: false,
      message: 'Error al crear la campaña',
      // Devolvemos el mensaje de error para facilitar la depuración.
      error: error.message 
    };
  }
});
