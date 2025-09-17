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
      // Begin transaction
      await client.query('BEGIN');
      
      try {
        // Insert into email_clicks table
        const emailClickQuery = emailSendId 
          ? 'INSERT INTO "email_clicks" ("lead_id", "campaign_id", "email_send_id", "original_url", "ip_address", "user_agent") VALUES ($1, $2, $3, $4, $5, $6) RETURNING id'
          : 'INSERT INTO "email_clicks" ("lead_id", "campaign_id", "original_url", "ip_address", "user_agent") VALUES ($1, $2, $3, $4, $5) RETURNING id';
        
        const emailClickParams = emailSendId 
          ? [leadId, campaignId, emailSendId, originalUrl, ipAddress, userAgent]
          : [leadId, campaignId, originalUrl, ipAddress, userAgent];

        const emailClickResult = await client.query(emailClickQuery, emailClickParams);
        const emailClickId = emailClickResult.rows[0].id;
        
        // Also track in lead_interactions
        const interactionQuery = `
          INSERT INTO lead_interactions (
            lead_id,
            interaction_type,
            source,
            medium,
            campaign,
            ip_address,
            user_agent,
            metadata
          )
          SELECT 
            $1::uuid,
            'email_click',
            'email_campaign',
            'email',
            c.name,
            $2::inet,
            $3,
            jsonb_build_object(
              'campaign_id', $4::uuid,
              'email_click_id', $5::uuid,
              'email_send_id', $6::uuid,
              'original_url', $7
            )
          FROM campaign c
          WHERE c.id = $4
        `;
        
        await client.query(interactionQuery, [
          leadId,
          ipAddress,
          userAgent,
          campaignId,
          emailClickId,
          emailSendId || null,
          originalUrl
        ]);
        
        await client.query('COMMIT');
        console.log('Clic de correo electrónico registrado exitosamente en ambas tablas.'); // Log de éxito
      } catch (innerError) {
        await client.query('ROLLBACK');
        throw innerError;
      }
    });
  } catch (error) {
    console.error('Error al registrar el clic de correo electrónico:', error); // Log de error
  }

  // Redirigir al usuario a la URL original, incluso si hubo un error en la base de datos
  console.log(`Redirigiendo a: ${originalUrl}`); // Log de redirección
  await sendRedirect(event, originalUrl, 302);
});