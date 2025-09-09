import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "~/server/db";
import { profiles, sessions, magicTokens } from "~/server/db/schema";
import { sendEmail } from "~/server/utils/aws/sesClient";
import { getMagicLinkTemplate } from "~/server/lib/templates/magicLinkTemplate";

export const auth = betterAuth({
  basePath: "/api/authentication",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: profiles,
      session: sessions,
      magicToken: magicTokens,
    },
  }),
  emailAndPassword: {
    enabled: false, // Disabled since using magic links
  },
  magicLink: {
    enabled: true,
    sendMagicLink: async ({ email, url, token }) => {
      try {
        const html = getMagicLinkTemplate(url);

        await sendEmail({
          fromEmailAddress: "anderson.arevalo@warolabs.com",
          fromName: "Saifer - Warolabs",
          toEmailAddresses: [email],
          subject: "🔑 Tu acceso a Warolabs está listo",
          bodyHtml: html
        });

        console.log(`Magic link sent successfully to: ${email}`);
      } catch (error) {
        console.error("Error sending magic link email:", error);
        throw error;
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
});

export const { GET, POST } = auth.handler;