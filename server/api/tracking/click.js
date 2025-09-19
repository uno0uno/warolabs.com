import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';
import { sendRedirect } from 'h3';

export default defineEventHandler(async (event) => {
  console.log('API de tracking/click llamada.'); // Log de entrada
  
  const { leadId, campaignId, redirectTo, emailSendId } = getQuery(event);

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
  
  console.log(`Intentando registrar clic para: leadId=${leadId}, campaignId=${campaignId}, emailSendId=${emailSendId}, URL=${originalUrl}`); // Log de datos recibidos
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
        VALUES ($1, 'email_click', 'email_campaign', 'email', $2, '{}')
      `;
      
      await client.query(interactionQuery, [
        leadId,
        campaignId
      ]);
      
      console.log('Clic de correo electrónico registrado exitosamente en lead_interactions.'); // Log de éxito
    });
  } catch (error) {
    console.error('Error al registrar el clic de correo electrónico:', error); // Log de error
  }

  // Redirigir al usuario a la URL original, incluso si hubo un error en la base de datos
  console.log(`Redirigiendo a: ${originalUrl}`); // Log de redirección
  await sendRedirect(event, originalUrl, 302);
});