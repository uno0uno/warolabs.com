import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  // El 'id' que viene en la URL es el campaign_id que usamos para agrupar el par
  const { id: pairId } = event.context.params; 
  const body = await readBody(event);
  const {
    emailTemplateContent,
    landingTemplateContent,
    subjectTemplate,
    emailTemplateName,
    landingTemplateName
  } = body;

  if (!pairId || !emailTemplateContent || !landingTemplateContent || !emailTemplateName || !landingTemplateName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Faltan parámetros requeridos para actualizar las plantillas.',
    });
  }

  try {
    const result = await withPostgresClient(async (pgClient) => {
      const { rows } = await pgClient.query(
        `SELECT * FROM update_template_pairs($1, $2, $3, $4, $5, $6)`,
        [
          pairId,
          emailTemplateContent,
          landingTemplateContent,
          subjectTemplate,
          emailTemplateName,
          landingTemplateName
        ]
      );
      return rows[0];
    });

    if (!result || !result.success) {
      throw new Error(result?.message || 'La función de la base de datos no devolvió un resultado exitoso.');
    }

    return {
      success: true,
      message: 'El par de plantillas se ha actualizado correctamente.',
      data: result,
    };

  } catch (error) {
    // Loguea el error detallado en la consola del servidor para facilitar la depuración
    console.error('Error detallado del endpoint al actualizar plantillas:', error);

    // Devuelve el mensaje de error específico de la base de datos si está disponible
    const dbErrorMessage = error.message || 'Ocurrió un error interno al intentar actualizar las plantillas.';
    
    throw createError({
      statusCode: 500,
      statusMessage: dbErrorMessage,
    });
  }
});