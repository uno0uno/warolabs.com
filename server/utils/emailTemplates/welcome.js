// server/utils/emailTemplates/welcome.js

/**
 * Generates the HTML for the welcome email.
 * @param {object} params - Parameters for the template.
 * @param {string} params.name - The name of the new lead.
 * @param {string} params.verificationToken - The unique token for verification.
 * @param {string} params.baseUrl - The base URL of the site from runtime config.
 * @returns {string} - The email's HTML.
 */
export const getWelcomeTemplate = ({ name, verificationToken, baseUrl }) => {
  // Construye el enlace de verificación completo
  const verificationLink = `${baseUrl}api/marketing/verify-lead?token=${verificationToken}`;
  console.log(`Generated verification link: ${verificationLink}`);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Waro Labs!</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background-color: #000; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; text-align: left; line-height: 1.6; }
        .button-container { text-align: center; margin: 30px 0; }
        .button { background-color: #007bff; color: white !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
        .footer { font-size: 12px; text-align: center; color: #777; margin-top: 20px; padding: 0 20px; }
        h1, h2 { color: #000; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Waro Labs</h1>
        </div>
        <div class="content">
          <h2>Hi, ${name}!</h2>
          <p>We welcome you to the Waro Labs community. We are excited to have you with us.</p>
          <p><strong>Please verify your email address by clicking the button below:</strong></p>
          <div class="button-container">
            <a href="${verificationLink}" class="button">Verify Email</a>
          </div>
          <p>Our mission is to make technology and artificial intelligence accessible to everyone. Get ready to receive news about our upcoming events, courses, and exclusive content.</p>
          <p>Life is a party! 🚀</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Waro Labs. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};