import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';
import { sendRedirect } from 'h3';

export default defineEventHandler(async (event) => {
  console.log('API de tracking/click llamada.'); // Log de entrada
  
  const { leadId, campaignId, redirectTo } = getQuery(event);

  if (!leadId || !campaignId || !redirectTo) {
    console.error('Error: Parámetros de seguimiento incompletos. No se registrará el clic.'); // Log de error
    throw createError({
      statusCode: 400,
      statusMessage: 'Parámetros de seguimiento incompletos.',
    });
  }

  const originalUrl = decodeURIComponent(redirectTo);
  const ipAddress = getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress;
  const userAgent = getHeader(event, 'user-agent');
  
  console.log(`Intentando registrar clic para: leadId=${leadId}, campaignId=${campaignId}, URL=${originalUrl}`); // Log de datos recibidos
  console.log(`Detalles del cliente: IP=${ipAddress}, User-Agent=${userAgent}`); // Log de detalles del cliente

  try {
    await withPostgresClient(async (client) => {
      await client.query(
        'INSERT INTO "email_clicks" ("lead_id", "campaign_id", "original_url", "ip_address", "user_agent") VALUES ($1, $2, $3, $4, $5)',
        [leadId, campaignId, originalUrl, ipAddress, userAgent]
      );
    });
    console.log('Clic de correo electrónico registrado exitosamente.'); // Log de éxito
  } catch (error) {
    console.error('Error al registrar el clic de correo electrónico:', error); // Log de error
  }

  // Redirigir al usuario a la URL original, incluso si hubo un error en la base de datos
  console.log(`Redirigiendo a: ${originalUrl}`); // Log de redirección
  await sendRedirect(event, originalUrl, 302);
});