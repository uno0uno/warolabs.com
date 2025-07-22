import { withPostgresClient } from '../basedataSettings/withPostgresClient'; // Asegúrate de que la ruta sea correcta

/**
 * Fetches and generates the HTML for an email template based on campaign UUID.
 * @param {object} params - Parameters for the template.
 * @param {string} params.campaignUuid - The UUID of the campaign to fetch the template from.
 * @param {string} params.name - The name of the new lead.
 * @param {string} params.verificationToken - The unique token for verification.
 * @param {string} params.baseUrl - The base URL of the site from runtime config.
 * @returns {Promise<string|null>} - The email's HTML or null if template not found or an error occurs.
 */
export const getWelcomeTemplate = async ({ campaignUuid, name, verificationToken, baseUrl }) => {

  const verificationLink = `${baseUrl}api/marketing/verify-lead?token=${verificationToken}`;

  console.log(`Generated verification link: ${verificationLink}`);

  let templateContent = null;

  try {
    await withPostgresClient(async (client) => {
      // 1. Obtener el template_version_id de la campaña 'campaign'
      const campaignQueryResult = await client.query(
        'SELECT template_version_id FROM public.campaign WHERE id = $1',
        [campaignUuid]
      );

      if (campaignQueryResult.rows.length === 0) {
        console.warn(`Campaña con UUID ${campaignUuid} no encontrada.`);
        return; // Retorna sin contenido si la campaña no existe
      }

      const templateVersionId = campaignQueryResult.rows[0].template_version_id;

      if (!templateVersionId) {
        console.warn(`No se encontró template_version_id para la campaña ${campaignUuid}.`);
        return; // Retorna sin contenido si no hay template_version_id asociado
      }

      // 2. Obtener el contenido del template usando el template_version_id de la tabla 'template_versions'
      const templateVersionResult = await client.query(
        'SELECT content FROM public.template_versions WHERE id = $1',
        [templateVersionId]
      );


      if (templateVersionResult.rows.length === 0) {
        console.warn(`Versión del template con ID ${templateVersionId} no encontrada.`);
        return; // Retorna sin contenido si la versión del template no existe
      }

      templateContent = templateVersionResult.rows[0].content;
    });
  } catch (error) {
    console.error('Error al obtener el template de la base de datos:', error);
    // En un entorno de producción, podrías querer registrar este error y/o notificarlo.
    return null; // Retorna null en caso de error en la base de datos
  }

  if (!templateContent) {
    console.warn(`No se pudo recuperar el contenido del template para la campaña ${campaignUuid}.`);
    // Opcional: podrías retornar un template estático por defecto aquí si prefieres un fallback.
    return null;
  }

  // Reemplazar los marcadores de posición en el contenido del template obtenido de la base de datos.
  // Es crucial que los marcadores de posición en tu HTML guardado en la DB coincidan (ej. ${name}, ${verificationLink})
  let finalHtml = templateContent.replace(/\${name}/g, name);
  finalHtml = finalHtml.replace(/\${verificationLink}/g, verificationLink);
  // Añade aquí más reemplazos si tu template dinámico tiene otros parámetros
  // Por ejemplo: finalHtml = finalHtml.replace(/\${otroParametro}/g, otroParametro);

  return finalHtml;
};