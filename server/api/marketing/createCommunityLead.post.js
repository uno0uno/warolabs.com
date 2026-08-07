import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { sendEmail } from '../../utils/aws/sesClient';
import { defineEventHandler, readBody, createError } from 'h3';

const COMMUNITY_CAMPAIGN_ID = '5c96fcd6-1050-47ce-aeb3-5c5bae79d169';
const COMMUNITY_PROFILE_ID = '7fe92b2c-d99e-4c70-b0cb-74af6326da5a';
const COMMUNITY_SENDER_FALLBACK = 'anderson.arevalo@warolabs.com';

function buildWelcomeEmail(email) {
  const { emailFrom } = useRuntimeConfig();
  return {
    fromEmailAddress: emailFrom || COMMUNITY_SENDER_FALLBACK,
    fromName: 'WARO Labs',
    toEmailAddresses: [email],
    subject: '¡Gracias por unirte! — WARO Labs',
    bodyText:
      'WARO Labs\n\n' +
      'Hola,\n\n' +
      '¡Bienvenido a la comunidad! Te escribiremos cuando publiquemos algo nuevo. Sin spam, prometido.\n\n' +
      'Si tienes alguna pregunta, no dudes en responder a este correo.\n\n' +
      '¡Hasta pronto!\n' +
      'El equipo de WARO Labs\n\n' +
      '----\n' +
      'Anderson Arévalo\n' +
      'Fundador WARO Labs\n' +
      'Bogotá, D.C, Colombia\n' +
      'Tecnología colombiana para el mundo. warolabs.com\n\n' +
      `Este correo fue enviado a ${email} porque te registraste en warolabs.com`,
  };
}

async function sendWelcomeEmail(email) {
  try {
    await sendEmail(buildWelcomeEmail(email));
  } catch (err) {
    console.error('[createCommunityLead] Error sending welcome email:', err);
  }
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9-]{1,200}$/.test(slug);
}

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
  }

  const body = await readBody(event);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
  const referrer = typeof body?.referrer === 'string' ? body.referrer : null;

  if (!isValidEmail(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid email.' });
  }
  if (!isValidSlug(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid slug.' });
  }

  const source = `blog:community:${slug}`;
  const userAgent = event.node?.req?.headers?.['user-agent'] || null;
  const ip = event.node?.req?.socket?.remoteAddress || null;

  return await withPostgresClient(async (client) => {
    const existing = await client.query(
      `SELECT id FROM leads WHERE profile_id = $1 AND email = $2 ORDER BY created_at DESC LIMIT 1`,
      [COMMUNITY_PROFILE_ID, email]
    );

    let leadId;
    const isNewLead = existing.rows.length === 0;
    if (!isNewLead) {
      leadId = existing.rows[0].id;
    } else {
      const inserted = await client.query(
        `INSERT INTO leads (profile_id, source, medium, referrer_url, ip_address, user_agent, status, is_verified, email)
         VALUES ($1, $2, $3, $4, $5, $6, 'active', false, $7)
         RETURNING id`,
        [COMMUNITY_PROFILE_ID, source, 'blog', referrer, ip, userAgent, email]
      );
      leadId = inserted.rows[0].id;
    }

    await client.query(
      `INSERT INTO campaign_leads (campaign_id, lead_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [COMMUNITY_CAMPAIGN_ID, leadId]
    );

    if (isNewLead) {
      sendWelcomeEmail(email).catch((err) =>
        console.error('[createCommunityLead] Welcome email task failed:', err)
      );
    }

    return { success: true, data: { leadId, campaignId: COMMUNITY_CAMPAIGN_ID, source } };
  }, event);
});
