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
    let campaignExists = false;

    // Verificar si la campaña existe en la base de datos
    console.log(`Verificando la existencia de la campaña con ID: ${campaignId}`);
    await withPostgresClient(async (client) => {
      const result = await client.query('SELECT 1 FROM campaign WHERE id = $1', [campaignId]);
      campaignExists = result.rows.length > 0;
    });

    if (!campaignExists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaña no encontrada.',
      });
    }

    // Determinar a qué leads enviar el correo electrónico
    if (emails && Array.isArray(emails) && emails.length > 0) {
      console.log(`Se encontraron emails en la solicitud. Buscando leads con los emails proporcionados: ${emails.join(', ')}`);
      leadsToSend = await withPostgresClient(async (client) => {
        // Consulta para obtener leads con id y email para los correos electrónicos proporcionados
        const result = await client.query(`
          SELECT 
            l.id, 
            p.email 
          FROM leads l
          JOIN profile p ON l.profile_id = p.id
          WHERE p.email = ANY($1::text[])
        `, [emails]);
        return result.rows;
      });
    } else {
      console.log('No se encontraron emails en la solicitud. Obteniendo todos los leads de la campaña.');
      // Si no se proporcionan correos, obtener todos los leads asociados con la campaña
      leadsToSend = await withPostgresClient(async (client) => {
        // La tabla 'campaign_leads' relaciona leads con campañas.
        const result = await client.query(`
          SELECT 
            l.id, 
            p.email
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

    // Utilizar el subject y bodyHtml del cuerpo de la solicitud
    const emailSubject = subject || 'Asunto no disponible';
    const emailBody = bodyHtml || '<p>Este es el cuerpo de tu campaña.</p>';

    for (const lead of leadsToSend) {
      const trackedHtmlBody = injectTracking(emailBody, lead.id, campaignId, baseUrl);

      console.log(trackedHtmlBody)
      
      console.log(`Enviando correo a ${lead.email} para el lead ID: ${lead.id}`);
      await sendEmail({
        fromEmailAddress: config.emailFrom,
        toEmailAddresses: [lead.email],
        subject: emailSubject,
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