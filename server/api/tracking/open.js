import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  console.log('API de tracking/open llamada.'); // Log de entrada
  
  const { leadId, campaignId } = getQuery(event);

  if (!leadId || !campaignId) {
    console.warn('Advertencia: Falta leadId o campaignId en la URL. No se registrará la apertura.'); // Log de advertencia
    event.node.res.setHeader('Content-Type', 'image/gif');
    return Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
  }

  const ipAddress = getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress;
  const userAgent = getHeader(event, 'user-agent');

  console.log(`Intentando registrar apertura para: leadId=${leadId}, campaignId=${campaignId}`); // Log de datos recibidos
  console.log(`Detalles del cliente: IP=${ipAddress}, User-Agent=${userAgent}`); // Log de detalles del cliente

  try {
    await withPostgresClient(async (client) => {
      await client.query(
        'INSERT INTO "email_opens" ("lead_id", "campaign_id", "ip_address", "user_agent") VALUES ($1, $2, $3, $4)',
        [leadId, campaignId, ipAddress, userAgent]
      );
    });
    console.log('Apertura de correo electrónico registrada exitosamente.'); // Log de éxito
  } catch (error) {
    console.error('Error al registrar la apertura de correo electrónico:', error); // Log de error
  }

  // Siempre responde con una imagen de píxel, incluso si hubo un error en la base de datos
  event.node.res.setHeader('Content-Type', 'image/gif');
  return Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
});