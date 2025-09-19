import { defineEventHandler, readBody, createError } from 'h3';
import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';
import { injectTracking } from '~/server/utils/tracking';
import { sendEmail } from '~/server/utils/aws/sesClient';
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation';
import { emitProgress } from './send-progress.get.js';

export default withTenantIsolation(async (event) => {
  const tenantContext = event.context.tenant;
  console.log('API de envío a grupos de leads llamada.');
  
  const { 
    templateId, 
    leadGroupIds, // Array de IDs de grupos
    campaignId, // Opcional: para asociar con campaña existente
    subject, // Opcional: override del subject del template
    sender = 'noreply@warolabs.com',
    campaignName, // Opcional: nombre para crear nueva campaña
    sessionId // ID de sesión para SSE
  } = await readBody(event);
  
  const config = useRuntimeConfig();
  const { baseUrl } = config.public;

  // Validaciones
  if (!templateId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El ID del template es requerido.',
    });
  }

  if (!leadGroupIds || !Array.isArray(leadGroupIds) || leadGroupIds.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Debe especificar al menos un grupo de leads.',
    });
  }

  // Authentication and tenant isolation handled by withTenantIsolation wrapper

  try {
    let templateData;
    let campaignData;
    let finalCampaignId = campaignId;

    // 1. Obtener información del template con tenant isolation
    console.log(`🔐 Obteniendo template con ID: ${templateId} para tenant: ${tenantContext.tenant_name}`);
    await withPostgresClient(async (client) => {
      const baseQuery = `
        SELECT 
          t.id,
          t.template_name as template_name,
          t.subject_template,
          tv.id as template_version_id,
          tv.content,
          tv.version_number
        FROM templates t
        JOIN template_versions tv ON t.id = tv.template_id AND t.active_version_id = tv.id
        JOIN profile p ON t.created_by_profile_id = p.id
        JOIN tenant_members tm ON p.id = tm.user_id
        WHERE t.id = $1 AND t.is_deleted = false
      `;
      
      const { query, params } = addTenantFilterSimple(baseQuery, tenantContext, [templateId]);
      const result = await client.query(query, params);
      
      if (result.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Template no encontrado.',
        });
      }
      
      templateData = result.rows[0];
    });

    // 2. Crear o validar campaña
    if (!finalCampaignId && campaignName) {
      console.log(`Creando nueva campaña: ${campaignName}`);
      await withPostgresClient(async (client) => {
        const result = await client.query(`
          INSERT INTO campaign (name, description, profile_id, created_at)
          VALUES ($1, $2, $3, NOW())
          RETURNING id
        `, [campaignName, `Campaña creada para template ${templateData.name}`, tenantContext.user_id]);
        
        finalCampaignId = result.rows[0].id;
      });
    } else if (finalCampaignId) {
      // Validar que la campaña existe
      await withPostgresClient(async (client) => {
        const result = await client.query(`
          SELECT id, name, description
          FROM campaign
          WHERE id = $1 AND (is_deleted = false OR is_deleted IS NULL)
        `, [finalCampaignId]);
        
        if (result.rows.length === 0) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Campaña no encontrada.',
          });
        }
        
        campaignData = result.rows[0];
      });
    }

    // 3. Obtener todos los leads de los grupos especificados con tenant isolation
    console.log(`🔐 Obteniendo leads de ${leadGroupIds.length} grupos para tenant: ${tenantContext.tenant_name}`);
    const leadsToSend = await withPostgresClient(async (client) => {
      const groupPlaceholders = leadGroupIds.map((_, index) => `$${index + 1}`).join(',');
      
      const baseQuery = `
        SELECT DISTINCT
          l.id,
          p.email,
          p.name as name,
          lg.name as group_name
        FROM lead_group_members lgm
        JOIN leads l ON lgm.lead_id = l.id
        JOIN profile p ON l.profile_id = p.id
        JOIN lead_groups lg ON lgm.group_id = lg.id
        JOIN profile lg_p ON lg.created_by_profile_id = lg_p.id
        JOIN tenant_members lg_tm ON lg_p.id = lg_tm.user_id
        WHERE lgm.group_id = ANY($1::uuid[])
        AND p.email IS NOT NULL
        ORDER BY p.email
      `;
      
      const { query, params } = addTenantFilterSimple(baseQuery, tenantContext, [leadGroupIds]);
      const result = await client.query(query, params);
      
      return result.rows;
    });

    if (!leadsToSend || leadsToSend.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No se encontraron leads en los grupos especificados.',
      });
    }

    console.log(`Se encontraron ${leadsToSend.length} leads únicos en los grupos.`);

    // Emitir inicio del proceso
    if (sessionId) {
      emitProgress({
        sessionId,
        type: 'start',
        total: leadsToSend.length,
        sent: 0,
        failed: 0,
        current: null,
        message: `Iniciando envío a ${leadsToSend.length} leads`,
        timestamp: new Date().toISOString()
      });
    }

    // 4. Preparar contenido del email (igual que send.js)
    const emailSubjectTemplate = subject || templateData?.subject_template || 'Asunto no disponible';
    const emailBodyTemplate = templateData?.content || '<p>Este es el cuerpo de tu email.</p>';
    const fromEmail = sender || 'noreply@warolabs.com';

    const results = [];
    const groupStats = {};

    // 5. Enviar emails a cada lead (usando lógica exitosa de send.js)
    for (let i = 0; i < leadsToSend.length; i++) {
      const lead = leadsToSend[i];
      let emailSendId;
      
      // Inicializar estadísticas del grupo
      if (!groupStats[lead.group_name]) {
        groupStats[lead.group_name] = { sent: 0, failed: 0 };
      }

      // Emitir progreso por cada lead
      if (sessionId) {
        emitProgress({
          sessionId,
          type: 'progress',
          total: leadsToSend.length,
          sent: results.filter(r => r.status === 'sent').length,
          failed: results.filter(r => r.status === 'failed').length,
          current: {
            index: i + 1,
            email: lead.email,
            group: lead.group_name
          },
          message: `Enviando a ${lead.email} (${i + 1}/${leadsToSend.length})`,
          timestamp: new Date().toISOString()
        });
      }
      
      try {
        // Registrar interacción email_sent en lead_interactions
        await withPostgresClient(async (client) => {
          const result = await client.query(`
            INSERT INTO lead_interactions (
              lead_id,
              interaction_type,
              source,
              medium,
              campaign_id,
              content,
              metadata
            )
            VALUES ($1, 'email_sent', 'group_email', 'email', $2, $3, $4)
            RETURNING id
          `, [
            lead.id,
            finalCampaignId || null,
            templateData?.template_name || 'Template sin nombre',
            JSON.stringify({
              template_id: templateId,
              template_version_id: templateData?.template_version_id,
              group_name: lead.group_name,
              subject: emailSubjectTemplate
            })
          ]);
          
          emailSendId = result.rows[0].id;
        });

        // Personalizar contenido (igual que send.js)
        const personalizedSubject = emailSubjectTemplate
          .replace(/{{nombre}}/g, lead.name || '')
          .replace(/{{correo}}/g, lead.email || '');
        
        const personalizedBodyHtml = emailBodyTemplate
          .replace(/{{nombre}}/g, lead.name || '')
          .replace(/{{correo}}/g, lead.email || '');

        // Inyectar tracking con emailSendId (igual que send.js)
        const trackedHtmlBody = injectTracking(personalizedBodyHtml, lead.id, finalCampaignId, baseUrl, emailSendId);

        console.log(`Enviando correo a ${lead.email} con el asunto: ${personalizedSubject}`);
        
        // Enviar email (igual que send.js)
        const emailResult = await sendEmail({
          fromEmailAddress: fromEmail,
          fromName: 'Warolabs',
          toEmailAddresses: [lead.email],
          subject: personalizedSubject,
          bodyHtml: trackedHtmlBody,
        });

        // Actualizar metadata con información del envío exitoso
        await withPostgresClient(async (client) => {
          await client.query(`
            UPDATE lead_interactions 
            SET metadata = metadata || $1::jsonb
            WHERE id = $2
          `, [
            JSON.stringify({
              status: 'sent',
              message_id: emailResult.MessageId || null,
              sent_at: new Date().toISOString()
            }),
            emailSendId
          ]);
        });

        groupStats[lead.group_name].sent++;
        results.push({
          leadId: lead.id,
          email: lead.email,
          status: 'sent',
          groupName: lead.group_name,
          emailSendId: emailSendId
        });

      } catch (error) {
        console.error(`Error enviando a ${lead.email}:`, error);
        
        // Actualizar metadata con información del error
        if (emailSendId) {
          await withPostgresClient(async (client) => {
            await client.query(`
              UPDATE lead_interactions 
              SET metadata = metadata || $1::jsonb
              WHERE id = $2
            `, [
              JSON.stringify({
                status: 'failed',
                error_message: error.message,
                failed_at: new Date().toISOString()
              }),
              emailSendId
            ]);
          });
        }

        groupStats[lead.group_name].failed++;
        results.push({
          leadId: lead.id,
          email: lead.email,
          status: 'failed',
          groupName: lead.group_name,
          error: error.message,
          emailSendId: emailSendId
        });
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const failureCount = results.filter(r => r.status === 'failed').length;

    // Emitir finalización del proceso
    if (sessionId) {
      emitProgress({
        sessionId,
        type: 'complete',
        total: leadsToSend.length,
        sent: successCount,
        failed: failureCount,
        current: null,
        message: `Proceso completado: ${successCount} enviados, ${failureCount} fallidos`,
        timestamp: new Date().toISOString(),
        summary: {
          total: results.length,
          sent: successCount,
          failed: failureCount
        },
        groupStats
      });
    }

    console.log('Proceso de envío a grupos finalizado exitosamente.');
    console.log(`Enviados: ${successCount}, Fallidos: ${failureCount}`);
    
    return { 
      success: true, 
      message: `Campaña a grupos procesada: ${successCount} enviados, ${failureCount} fallidos`,
      results: results,
      summary: {
        total: results.length,
        sent: successCount,
        failed: failureCount
      },
      data: {
        templateUsed: {
          id: templateData.id,
          name: templateData.template_name,
          version: templateData.version_number
        },
        campaignId: finalCampaignId,
        campaignName: campaignData?.name || campaignName,
        groupsProcessed: Object.keys(groupStats).length,
        groupStats: groupStats
      }
    };

  } catch (error) {
    console.error('Error al enviar la campaña a grupos:', error);
    
    // Emitir error si hay sessionId
    if (sessionId) {
      emitProgress({
        sessionId,
        type: 'error',
        message: `Error en el proceso de envío: ${error.message}`,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al enviar la campaña a grupos.',
    });
  }
});