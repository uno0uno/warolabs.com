import { withPostgresClient } from '../basedataSettings/withPostgresClient';

/**
 * Fetches and generates email details including template, subject, sender, and profile info.
 * Uses a single, efficient query.
 * @param {object} params - Parameters for the template.
 * @param {string} params.campaignUuid - The UUID of the campaign to fetch the template from.
 * @param {string} params.name - The name of the new lead to insert into the template.
 * @param {string} params.verificationToken - The unique token for verification.
 * @returns {Promise<{html: string, subject: string, sender: string, profileUserName: string, enterprise: string}|null>} - An object with the email and profile details, or null on error.
 */
export const getWelcomeTemplate = async ({ campaignUuid, name, verificationToken, host }) => {
  try {

    let emailAndProfileData = null;

    const query = `
      SELECT
          tv.content,
          t.subject_template,
          t.sender_email,
          p.user_name AS profile_user_name,
          p.enterprise,
          p.website
      FROM
          public.campaign AS c
      JOIN
          public.campaign_template_versions AS ctv ON c.id = ctv.campaign_id
      JOIN
          public.template_versions AS tv ON ctv.template_version_id = tv.id
      JOIN
          public.templates AS t ON tv.template_id = t.id
      JOIN
          public.profile AS p ON c.profile_id = p.id
      WHERE
          c.id = $1
          AND t.template_type = 'email'
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

    const baseUrl = emailAndProfileData.website;
    const verificationLink = `${baseUrl}/api/marketing/verify-lead?token=${verificationToken}&campaignId=${campaignUuid}`;

    let finalHtml = emailAndProfileData.content.replace(/\${name}/g, name);
    finalHtml = finalHtml.replace(/\${verificationLink}/g, verificationLink);

    return {
      html: finalHtml,
      subject: emailAndProfileData.subject_template,
      sender: emailAndProfileData.sender_email,
      profileUserName: emailAndProfileData.profile_user_name,
      enterprise: emailAndProfileData.enterprise,
    };

  } catch (error) {
    console.error('Error fetching welcome template and profile data from database:', error);
    return null;
  }
};
