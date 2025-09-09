// server/api/auth/send-magic-link.post.js
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { sendEmail } from '../../utils/aws/sesClient';
import crypto from 'node:crypto';
import handlebars from 'handlebars';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { db } from '../../db';
import { magicTokens } from '../../db/schema';

export default defineEventHandler(async (event) => {

    const { 
     public: { baseUrl }
  } = useRuntimeConfig();

  const body = await readBody(event);
  const { email } = body;

  if (!email) {
    return {
      error: 'Email is required.',
    };
  }

  try {
    const user = await withPostgresClient(async (client) => {
      const result = await client.query('SELECT id, name, email FROM "profile" WHERE email = $1', [email]);
      return result.rows[0];
    });

    if (!user) {
      return {
        error: 'User not found.',
      };
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); 

    await db.insert(magicTokens).values({
      id: crypto.randomUUID(),
      userId: user.id,
      token,
      expiresAt,
    });
    
    const magicLink = `${baseUrl}auth/verify?token=${token}`;

    const templatePath = path.join(process.cwd(), 'server', 'lib', 'templates', 'magic-link.html');
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateHtml);

    const html = template({
      name: user.name,
      magicLink,
      email: user.email,
    });

    const { emailFrom } = useRuntimeConfig();
    
    await sendEmail({
      fromEmailAddress: emailFrom || 'noreply@warolabs.com',
      fromName: 'Warolabs',
      toEmailAddresses: [user.email],
      subject: 'Tu enlace mágico para ingresar - Warolabs',
      bodyHtml: html,
    });

    console.log(`Sending magic link to ${email}: ${magicLink}`);

    return {
      message: 'Magic link sent successfully!',
    };
  } catch (error) {
    console.error('Error sending magic link:', error);
    return {
      error: 'An unexpected error occurred.',
    };
  }
});