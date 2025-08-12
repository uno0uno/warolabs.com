import { withPostgresClient } from '../basedataSettings/withPostgresClient';

/**
 * Fetches and generates email details including template, subject, sender, and profile info.
 * Uses a single, efficient query.
 * @param {object} params - Parameters for the template.
 * @param {string} params.campaignUuid - The UUID of the campaign to fetch the template from.
 * @param {string} params.name - The name of the new lead to insert into the template.
 * @param {string} params.verificationToken - The unique token for verification.
 * @param {string} params.baseUrl - The base URL of the site.
 * @returns {Promise<{html: string, subject: string, sender: string, profileUserName: string, enterprise: string}|null>} - An object with the email and profile details, or null on error.
 */
export const getWelcomeTemplate = async ({ campaignUuid, name, verificationToken, baseUrl }) => {
  const verificationLink = `${baseUrl}api/marketing/verify-lead?token=${verificationToken}`;

  try {
    let emailAndProfileData = null;

    // Consulta única que obtiene todo lo necesario: plantilla y datos del perfil.
    const query = `
      SELECT
          tv.content,
          t.subject_template,
          t.sender_email,
          p.user_name AS profile_user_name, -- Cambiado de name a user_name
          p.enterprise
      FROM
          public.campaign AS c
      JOIN
          public.template_versions AS tv ON c.template_version_id = tv.id
      JOIN
          public.templates AS t ON tv.template_id = t.id
      JOIN
          public.profile AS p ON c.profile_id = p.id
      WHERE
          c.id = $1
      ORDER BY
          tv.version_number DESC
      LIMIT 1;
    `;

    await withPostgresClient(async (client) => {
      const result = await client.query(query, [campaignUuid]);
      if (result.rows.length > 0) {
        emailAndProfileData = result.rows[0];
      }
    });

    if (!emailAndProfileData) {
      console.warn(`No data found for campaign ${campaignUuid}.`);
      return null;
    }

    // Reemplaza los marcadores de posición
    let finalHtml = emailAndProfileData.content.replace(/\${name}/g, name);
    finalHtml = finalHtml.replace(/\${verificationLink}/g, verificationLink);

    // Retorna un objeto con todos los datos necesarios
    return {
      html: finalHtml,
      subject: emailAndProfileData.subject_template,
      sender: emailAndProfileData.sender_email,
      profileUserName: emailAndProfileData.profile_user_name, // Usando el nuevo alias
      enterprise: emailAndProfileData.enterprise
    };

  } catch (error) {
    console.error('Error fetching welcome template and profile data from database:', error);
    return null;
  }
};