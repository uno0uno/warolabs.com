import { defineEventHandler, readBody } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { sendEmail } from '../../utils/aws/sesClient';

// Función de renderizado genérica
const renderTemplate = (template, data) => {
  if (!template) {
    return '';
  }
  return template.replace(/\{\{([a-zA-Z0-9\p{L}_ ]+)\}\}/gu, (match, key) => {
    const trimmedKey = key.trim();
    const value = data[trimmedKey];
    return value !== null && value !== undefined ? value : '';
  });
};

export default defineEventHandler(async (event) => {
  const sentEmails = [];
  const failedEmails = [];

  try {
    const { campaignId, subject, bodyHtml, fromAddress, fromName, emails } = await readBody(event);
    
    if (!subject || !bodyHtml || !fromAddress || !fromName) {
      throw new Error('Subject, bodyHtml, fromAddress, and fromName are required in the request body.');
    }

    const result = await withPostgresClient(async (client) => {
      let params = [];
      let whereClauses = ["p.phone_number != '0'"];
      
      let query = `
        SELECT 
            p.email, 
            split_part(p.name, ' ', 1) as first_name,
            COALESCE(c.name, 'Emails seleccionados') as campaign_name
        FROM public.profile p
        JOIN public.leads l ON p.id = l.profile_id
        LEFT JOIN public.campaign_leads cl ON cl.lead_id = l.id
        LEFT JOIN public.campaign c ON cl.campaign_id = c.id
      `;

      if (campaignId) {
        params.push(campaignId);
        whereClauses.push(`cl.campaign_id = $${params.length}::uuid`);
      }
      
      if (emails && emails.length > 0) {
        params.push(emails);
        whereClauses.push(`p.email = ANY($${params.length}::text[])`);
      }

      // Si no hay filtros, no se agrega la cláusula WHERE.
      if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
      }

      query += ` ORDER BY p.created_at DESC;`;

      return await client.query(query, params);
    });

    const leads = result.rows;
    if (leads.length === 0) {
      return { success: true, message: 'No leads found.' };
    }

    for (const lead of leads) {
      const data = {
        'nombre': lead.first_name,
        'correo': lead.email,
        'nombre_campana': lead.campaign_name,
      };

      const finalSubject = renderTemplate(subject, data);
      const finalBodyHtml = renderTemplate(bodyHtml, data);

      const emailParams = {
        fromEmailAddress: fromAddress,
        fromName: fromName,
        toEmailAddresses: [lead.email],
        subject: finalSubject,
        bodyHtml: finalBodyHtml,
      };

      console.log(`Sending email to: ${lead.email}`);

      try {
        await sendEmail(emailParams);
        sentEmails.push(lead.email);
      } catch (emailError) {
        console.error(`Error sending email to ${lead.email}:`, emailError);
        failedEmails.push({ email: lead.email, error: emailError.message });
      }
    }

    return {
      success: true,
      message: `Emails sent successfully: ${sentEmails.length}. Emails failed: ${failedEmails.length}.`,
      sent: sentEmails,
      failed: failedEmails
    };

  } catch (error) {
    return {
      success: false,
      message: error.message,
      sent: sentEmails,
      failed: failedEmails
    };
  }
});