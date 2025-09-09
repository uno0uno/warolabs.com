import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';
import { injectTracking } from '~/server/utils/tracking';
import { sendEmail } from '~/server/utils/aws/sesClient';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';

export default defineEventHandler(async (event) => {
  console.log('API de envío de campaña llamada.');
  const { campaignId, emails, subject, bodyHtml } = await readBody(event);
  const config = useRuntimeConfig();
  const { baseUrl } = config.public;

  if (!campaignId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El ID de la campaña es inválido.',
    });
  }

  try {
    await verifyAuthToken(event);
  } catch (error) {
    throw error;
  }

  try {
    let leadsToSend;
    let campaignData;

    // 1. Obtener la información del propietario de la campaña
    console.log(`Verificando la existencia de la campaña y obteniendo datos del propietario con ID: ${campaignId}`);
    await withPostgresClient(async (client) => {
      const result = await client.query(`
        SELECT 
          c.name AS campaign_name,
          p.name AS owner_name,
          p.email AS owner_email
        FROM campaign c
        JOIN profile p ON c.profile_id = p.id
        WHERE c.id = $1
      `, [campaignId]);
      campaignData = result.rows[0];
    });

    if (!campaignData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaña no encontrada o no tiene un propietario válido.',
      });
    }

    // 2. Determinar a qué leads enviar el correo electrónico
    if (emails && Array.isArray(emails) && emails.length > 0) {
      console.log(`Se encontraron emails en la solicitud. Buscando leads con los emails proporcionados: ${emails.join(', ')}`);
      leadsToSend = await withPostgresClient(async (client) => {
        const result = await client.query(`
          SELECT 
            l.id, 
            p.email,
            p.name
          FROM leads l
          JOIN profile p ON l.profile_id = p.id
          WHERE p.email = ANY($1::text[])
        `, [emails]);
        return result.rows;
      });
    } else {
      console.log('No se encontraron emails en la solicitud. Obteniendo todos los leads de la campaña.');
      leadsToSend = await withPostgresClient(async (client) => {
        const result = await client.query(`
          SELECT 
            l.id, 
            p.email,
            p.name
          FROM leads l
          JOIN campaign_leads cl ON l.id = cl.lead_id
          JOIN profile p ON l.profile_id = p.id
          WHERE cl.campaign_id = $1
        `, [campaignId]);
        return result.rows;
      });
    }

    if (!leadsToSend || leadsToSend.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No se encontraron leads para esta campaña o los emails proporcionados no existen.',
      });
    }
    
    console.log(`Se encontraron ${leadsToSend.length} leads para enviar la campaña.`);

    const emailSubjectTemplate = subject || 'Asunto no disponible';
    const emailBodyTemplate = bodyHtml || '<p>Este es el cuerpo de tu campaña.</p>';

    for (const lead of leadsToSend) {
      // 3. Reemplazar marcadores de posición en el asunto y el cuerpo
      const personalizedSubject = emailSubjectTemplate
        .replace(/{{nombre}}/g, lead.name || '')
        .replace(/{{correo}}/g, lead.email || '')
        .replace(/{{nombre_propietario}}/g, campaignData.owner_name || '')
        .replace(/{{correo_propietario}}/g, campaignData.owner_email || '');
      
      const personalizedBodyHtml = emailBodyTemplate
        .replace(/{{nombre}}/g, lead.name || '')
        .replace(/{{correo}}/g, lead.email || '')
        .replace(/{{nombre_propietario}}/g, campaignData.owner_name || '')
        .replace(/{{correo_propietario}}/g, campaignData.owner_email || '');

      // 4. Inyectar el seguimiento después de la personalización
      const trackedHtmlBody = injectTracking(personalizedBodyHtml, lead.id, campaignId, baseUrl);

      console.log(`Enviando correo a ${lead.email} con el asunto: ${personalizedSubject}`);
      await sendEmail({
        fromEmailAddress: campaignData.owner_email,
        fromName: campaignData.owner_name,
        toEmailAddresses: [lead.email],
        subject: personalizedSubject,
        bodyHtml: trackedHtmlBody,
      });
    }

    console.log('Proceso de envío de campaña finalizado exitosamente.');
    return { success: true, message: 'Campaña enviada exitosamente.' };
  } catch (error) {
    console.error('Error al enviar la campaña:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al enviar la campaña.',
    });
  }
});