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
      // Begin transaction
      await client.query('BEGIN');
      
      try {
        // Insert into email_opens table
        const emailOpenQuery = emailSendId 
          ? 'INSERT INTO "email_opens" ("lead_id", "campaign_id", "email_send_id", "ip_address", "user_agent") VALUES ($1, $2, $3, $4, $5) RETURNING id'
          : 'INSERT INTO "email_opens" ("lead_id", "campaign_id", "ip_address", "user_agent") VALUES ($1, $2, $3, $4) RETURNING id';
        
        const emailOpenParams = emailSendId 
          ? [leadId, campaignId, emailSendId, ipAddress, userAgent]
          : [leadId, campaignId, ipAddress, userAgent];

        const emailOpenResult = await client.query(emailOpenQuery, emailOpenParams);
        const emailOpenId = emailOpenResult.rows[0].id;
        
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
            'email_open',
            'email_campaign',
            'email',
            c.name,
            $2::inet,
            $3,
            jsonb_build_object(
              'campaign_id', $4::uuid,
              'email_open_id', $5::uuid,
              'email_send_id', $6::uuid
            )
          FROM campaign c
          WHERE c.id = $4
        `;
        
        await client.query(interactionQuery, [
          leadId,
          ipAddress,
          userAgent,
          campaignId,
          emailOpenId,
          emailSendId || null
        ]);
        
        await client.query('COMMIT');
        console.log('Apertura de correo electrónico registrada exitosamente en ambas tablas.'); // Log de éxito
      } catch (innerError) {
        await client.query('ROLLBACK');
        throw innerError;
      }
    });
  } catch (error) {
    console.error('Error al registrar la apertura de correo electrónico:', error); // Log de error
  }

  // Siempre responde con una imagen de píxel, incluso si hubo un error en la base de datos
  event.node.res.setHeader('Content-Type', 'image/gif');
  return Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
});