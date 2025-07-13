// server/api/test/send-email.js

import { sendEmail } from '../../utils/aws/sesClient';
import { getWelcomeTemplate } from '../../utils/emailTemplates/welcome.js'; // Reutilizamos la plantilla de bienvenida para la prueba

export default defineEventHandler(async (event) => {

    try {
        const { emailFrom, public: { baseUrl } } = useRuntimeConfig();

        // 1. Define los datos para la prueba
        const testRecipient = 'warocol@gmail.com'; 
        const testName = 'Usuario de Prueba';

        // 2. Genera el cuerpo del correo usando una de tus plantillas
        const emailHtml = getWelcomeTemplate({
            name: testName,
            // Podemos usar un token falso, ya que solo estamos probando el envío
            verificationToken: 'dummy-test-token-12345', 
            baseUrl: baseUrl
        });

        // 3. Llama a la utilidad sendEmail
        console.log(`Intentando enviar un correo de prueba a ${testRecipient}...`);

        const result = await sendEmail({
            fromEmailAddress: emailFrom, // Asegúrate de que este remitente esté verificado en AWS SES
            toEmailAddresses: [testRecipient],
            subject: 'Correo de Prueba desde la Utilidad SES de Waro Labs',
            bodyHtml: emailHtml,
        });

        console.log('Correo de prueba enviado con éxito:', result);

        // 4. Devuelve una respuesta de éxito
        return {
            success: true,
            message: `Correo de prueba enviado exitosamente a ${testRecipient}.`,
            awsMessageId: result.MessageId,
        };

    } catch (error) {
        console.error('Error al enviar el correo de prueba:', error);

        // Devuelve una respuesta de error detallada para facilitar la depuración
        setResponseStatus(event, 500);
        return {
            success: false,
            message: 'Falló el envío del correo de prueba.',
            error: {
                name: error.name,
                message: error.message,
                // Ten cuidado al enviar el stack completo en un entorno de producción
                stack: error.stack 
            }
        };
    }
});