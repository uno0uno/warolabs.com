import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  console.log('API de tracking/open llamada.'); // Log de entrada
  
  const { leadId, campaignId, emailSendId } = getQuery(event);

  if (!leadId || !campaignId) {
    console.warn('Advertencia: Falta leadId o campaignId en la URL. No se registrará la apertura.'); // Log de advertencia
    event.node.res.setHeader('Content-Type', 'image/gif');
    return Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
  }

  const ipAddress = getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress;
  const userAgent = getHeader(event, 'user-agent');

  console.log(`Intentando registrar apertura para: leadId=${leadId}, campaignId=${campaignId}, emailSendId=${emailSendId}`); // Log de datos recibidos
  console.log(`Detalles del cliente: IP=${ipAddress}, User-Agent=${userAgent}`); // Log de detalles del cliente

  try {
    await withPostgresClient(async (client) => {
      // Track in lead_interactions only - simplified version
      const interactionQuery = `
        INSERT INTO lead_interactions (
          lead_id,
          interaction_type,
          source,
          medium,
          campaign_id,
          metadata
        )
        VALUES ($1, 'email_open', 'email_campaign', 'email', $2, '{}')
      `;
      
      console.log(`🎯 Attempting to track email open with params:`, {
        leadId,
        campaignId,
        emailSendId: emailSendId || null
      });
      
      await client.query(interactionQuery, [
        leadId,
        campaignId
      ]);
      
      console.log(`✅ EMAIL OPEN TRACKED: leadId=${leadId}, campaignId=${campaignId}, emailSendId=${emailSendId}`); // Log de éxito
    });
  } catch (error) {
    console.error('Error al registrar la apertura de correo electrónico:', error.message); // Log de error
    console.error('Error details:', {
      leadId,
      campaignId,
      ipAddress,
      userAgent,
      emailSendId,
      error: error.toString()
    });
  }

  // Siempre responde con una imagen de píxel, incluso si hubo un error en la base de datos
  event.node.res.setHeader('Content-Type', 'image/gif');
  return Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
});