// server/api/campaign/send.js
import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';
import { injectTracking } from '~/server/utils/tracking';
import { sendEmail } from '~/server/utils/aws/sesClient';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';

export default defineEventHandler(async (event) => {
  console.log('API de envío de campaña llamada.');
  const { campaignId, templateId, leadIds, subject, sender, emails, bodyHtml } = await readBody(event);
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
    let templateData;

    // 1. Obtener la información de la campaña
    console.log(`Verificando la existencia de la campaña con ID: ${campaignId}`);
    await withPostgresClient(async (client) => {
      const result = await client.query(`
        SELECT 
          c.id,
          c.name AS campaign_name,
          c.description
        FROM campaign c
        WHERE c.id = $1 AND (c.is_deleted = false OR c.is_deleted IS NULL)
      `, [campaignId]);
      campaignData = result.rows[0];
    });

    if (!campaignData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Campaña no encontrada.',
      });
    }

    // 2. Obtener template si se especificó
    if (templateId) {
      console.log(`Obteniendo template con ID: ${templateId}`);
      await withPostgresClient(async (client) => {
        const result = await client.query(`
          SELECT 
            t.name as template_name,
            t.subject_template,
            tv.id as template_version_id,
            tv.content,
            tv.version_number
          FROM templates t
          JOIN template_versions tv ON t.id = tv.template_id AND t.active_version_id = tv.id
          WHERE t.id = $1 AND t.is_deleted = false
        `, [templateId]);
        templateData = result.rows[0];
      });
    }

    // 3. Determinar a qué leads enviar el correo electrónico
    if (leadIds && Array.isArray(leadIds) && leadIds.length > 0) {
      console.log(`Enviando a leads específicos: ${leadIds.join(', ')}`);
      leadsToSend = await withPostgresClient(async (client) => {
        const result = await client.query(`
          SELECT 
            id, 
            email,
            name
          FROM leads 
          WHERE id = ANY($1::uuid[])
        `, [leadIds]);
        return result.rows;
      });
    } else if (emails && Array.isArray(emails) && emails.length > 0) {
      console.log(`Enviando a emails específicos: ${emails.join(', ')}`);
      leadsToSend = await withPostgresClient(async (client) => {
        const result = await client.query(`
          SELECT 
            id, 
            email,
            name
          FROM leads 
          WHERE email = ANY($1::text[])
        `, [emails]);
        return result.rows;
      });
    } else {
      console.log('Obteniendo todos los leads de la campaña.');
      leadsToSend = await withPostgresClient(async (client) => {
        const result = await client.query(`
          SELECT 
            l.id, 
            l.email,
            l.name
          FROM leads l
          JOIN campaign_leads cl ON l.id = cl.lead_id
          WHERE cl.campaign_id = $1
        `, [campaignId]);
        return result.rows;
      });
    }

    if (!leadsToSend || leadsToSend.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No se encontraron leads para enviar.',
      });
    }
    
    console.log(`Se encontraron ${leadsToSend.length} leads para enviar la campaña.`);

    const emailSubjectTemplate = subject || templateData?.subject_template || 'Asunto no disponible';
    const emailBodyTemplate = bodyHtml || templateData?.content || '<p>Este es el cuerpo de tu campaña.</p>';
    const fromEmail = sender || 'noreply@warolabs.com';

    const results = [];
    
    for (const lead of leadsToSend) {
      let emailSendId;
      
      try {
        // 4. Crear registro en email_sends ANTES del envío
        await withPostgresClient(async (client) => {
          const result = await client.query(`
            INSERT INTO email_sends (campaign_id, lead_id, email, subject, sent_at, status, template_id, template_version_id)
            VALUES ($1, $2, $3, $4, NOW(), 'sending', $5, $6)
            RETURNING id
          `, [campaignId, lead.id, lead.email, emailSubjectTemplate, templateId, templateData?.template_version_id]);
          
          emailSendId = result.rows[0].id;
        });

        // 5. Personalizar contenido
        const personalizedSubject = emailSubjectTemplate
          .replace(/{{nombre}}/g, lead.name || '')
          .replace(/{{correo}}/g, lead.email || '');
        
        const personalizedBodyHtml = emailBodyTemplate
          .replace(/{{nombre}}/g, lead.name || '')
          .replace(/{{correo}}/g, lead.email || '');

        // 6. Inyectar tracking con emailSendId
        const trackedHtmlBody = injectTracking(personalizedBodyHtml, lead.id, campaignId, baseUrl, emailSendId);

        console.log(`Enviando correo a ${lead.email} con el asunto: ${personalizedSubject}`);
        
        // 7. Enviar email
        const emailResult = await sendEmail({
          fromEmailAddress: fromEmail,
          fromName: 'Warolabs',
          toEmailAddresses: [lead.email],
          subject: personalizedSubject,
          bodyHtml: trackedHtmlBody,
        });

        // 8. Actualizar status a 'sent' con message_id
        await withPostgresClient(async (client) => {
          await client.query(`
            UPDATE email_sends 
            SET status = 'sent', message_id = $1, updated_at = NOW()
            WHERE id = $2
          `, [emailResult.MessageId || null, emailSendId]);
        });

        results.push({
          leadId: lead.id,
          email: lead.email,
          status: 'sent',
          emailSendId: emailSendId
        });

      } catch (error) {
        console.error(`Error enviando a ${lead.email}:`, error);
        
        // Actualizar status a 'failed'
        if (emailSendId) {
          await withPostgresClient(async (client) => {
            await client.query(`
              UPDATE email_sends 
              SET status = 'failed', error_message = $1, updated_at = NOW()
              WHERE id = $2
            `, [error.message, emailSendId]);
          });
        }

        results.push({
          leadId: lead.id,
          email: lead.email,
          status: 'failed',
          error: error.message,
          emailSendId: emailSendId
        });
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const failureCount = results.filter(r => r.status === 'failed').length;

    console.log('Proceso de envío de campaña finalizado exitosamente.');
    console.log(`Enviados: ${successCount}, Fallidos: ${failureCount}`);
    
    return { 
      success: true, 
      message: `Campaña procesada: ${successCount} enviados, ${failureCount} fallidos`,
      results: results,
      summary: {
        total: results.length,
        sent: successCount,
        failed: failureCount
      }
    };
  } catch (error) {
    console.error('Error al enviar la campaña:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al enviar la campaña.',
    });
  }
});