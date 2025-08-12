import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

/**
 * Creates and configures an AWS SES client.
 * Credentials and region are obtained from environment variables.
 */
export function createSESClient() {
    const { 
        awsAccessKeyId, 
        awsSecretAccessKey, 
        awsRegion, 
    } = useRuntimeConfig();

    if (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion) {
        throw new Error('Missing AWS SES configuration in runtimeConfig. Please check .env and nuxt.config.ts.');
    }

    return new SESClient({
        region: awsRegion,
        credentials: {
            accessKeyId: awsAccessKeyId,
            secretAccessKey: awsSecretAccessKey,
        },
    });
}

/**
 * Sends an email using Amazon SES.
 * @param {object} params - Email parameters.
 * @param {string} params.fromEmailAddress - Sender email address (must be verified in SES).
 * @param {string} [params.fromName] - (Opcional) El nombre para mostrar del remitente (ej. 'Equipo de Soporte').
 * @param {string[]} params.toEmailAddresses - Array of recipient email addresses.
 * @param {string} params.subject - Email subject.
 * @param {string} params.bodyHtml - HTML content of the email.
 * @param {string} [params.bodyText] - Plain text content of the email (optional).
 * @returns {Promise<object>} The result of the email sending operation.
 */
export async function sendEmail(params) {
    const sesClient = createSESClient();

    const {
        fromEmailAddress,
        fromName,
        toEmailAddresses,
        subject,
        bodyHtml,
        bodyText
    } = params;

    const source = fromName ? `${fromName} <${fromEmailAddress}>` : fromEmailAddress;

    const input = {
        Source: source,
        Destination: {
            ToAddresses: toEmailAddresses,
        },
        Message: {
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: bodyHtml,
                },
            },
        },
    };

    if (bodyText) {
        input.Message.Body.Text = {
            Charset: "UTF-8",
            Data: bodyText,
        };
    }

    const command = new SendEmailCommand(input);

    try {
        const response = await sesClient.send(command);
        console.log("Email sent successfully:", response.MessageId);
        return response;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}