import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';
import { sendEmail } from '../../utils/aws/sesClient';
import { getWelcomeTemplate } from '../../utils/emailTemplates/welcome.js'; // Asegúrate de que la ruta sea correcta
import crypto from 'crypto';
import { createError } from 'h3';
import { parsePemKey } from '../../utils/commons/keyParser.js';

export default defineEventHandler(async (event) => {
    if (event.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: 'This endpoint only accepts POST requests.' });
    }

    const body = await readBody(event);
    const {
        campaignId,
        leadEmail,
        leadSource,
        profileName,
        profilePhoneNumber,
        profileNationalityId,
        encryptedEmailFrom
    } = body;

    if (!campaignId || !leadEmail || !encryptedEmailFrom) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing required parameters: campaignId, leadEmail, encryptedEmailFrom.' });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(campaignId)) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid campaignId format. It must be a valid UUID.' });
    }

    if (!leadEmail.includes('@') || !leadEmail.includes('.')) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid leadEmail format.' });
    }

    let actualEmailFrom;
    try {
        const { privateKeyEncrypter } = useRuntimeConfig();

        if (!privateKeyEncrypter) {
            throw createError({ statusCode: 500, statusMessage: 'Server Configuration Error', message: 'RSA Private Key is not configured on the server.' });
        }

        const parsedPrivateKey = parsePemKey(privateKeyEncrypter);

        actualEmailFrom = crypto.privateDecrypt(
            {
                key: parsedPrivateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            Buffer.from(encryptedEmailFrom, 'base64')
        ).toString('utf8');

        if (!actualEmailFrom.includes('@') || !actualEmailFrom.includes('.')) {
            throw new Error('Decrypted emailFrom has an invalid format.');
        }

    } catch (encryptionError) {
        console.error('Error decrypting emailFrom:', encryptionError);
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Failed to decrypt emailFrom. Invalid encryption or format.',
            data: { details: encryptionError.message }
        });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const { leadId, profileId: associatedProfileId, associationStatus } = await withPostgresClient(async (client) => {
        try {
            await verifyAuthToken(event); // Verificar el token de autenticación
        } catch (error) {
            throw error; // Propagar errores de autenticación
        }

        try {
            const query = `
                SELECT
                    t.lead_return_id,
                    t.profile_return_id,
                    t.association_status
                FROM public.manage_lead_and_campaign_association(
                    $1::UUID,       -- p_campaign_id
                    $2::VARCHAR,    -- p_lead_email
                    $3::VARCHAR,    -- p_lead_source
                    $4::VARCHAR,    -- p_profile_name
                    $5::VARCHAR,    -- p_profile_phone_number
                    $6::INTEGER,    -- p_profile_nationality_id
                    $7::TEXT        -- p_verification_token
                ) AS t;
            `;
            const values = [
                campaignId,
                leadEmail,
                leadSource || null,
                profileName || null,
                profilePhoneNumber || null,
                profileNationalityId || null,
                verificationToken
            ];

            const result = await client.query(query, values);

            return {
                leadId: result.rows[0].lead_return_id,
                profileId: result.rows[0].profile_return_id,
                associationStatus: result.rows[0].association_status
            };
        } catch (pgError) {
            if (pgError.code === 'P0001') {
                let statusCode = 400;
                let friendlyMessage = pgError.message;

                if (pgError.message.includes('La campaña con ID') && pgError.message.includes('no existe')) {
                    statusCode = 404;
                    friendlyMessage = 'The specified campaign does not exist.';
                } else if (pgError.message.includes('Para crear un nuevo perfil') || pgError.message.includes('Missing or invalid profile data')) {
                    statusCode = 400;
                    friendlyMessage = 'Incomplete or invalid profile data for a new lead/profile.';
                }

                throw createError({
                    statusCode: statusCode,
                    statusMessage: friendlyMessage,
                    message: friendlyMessage,
                    data: { originalPgError: pgError.message }
                });
            } else {
                throw pgError;
            }
        }
    }, event);

    const responsePayload = {
        leadId,
        profileId: associatedProfileId,
        status: associationStatus
    };

    if (associationStatus.includes('_association_created')) {
        setResponseStatus(event, 201);
        responsePayload.message = 'Lead successfully associated with campaign.';

        if (associationStatus.includes('lead_created')) {
            try {
                const { public: { baseUrl } } = useRuntimeConfig();

                // ***** MODIFICACIÓN AQUÍ: Llamar a getWelcomeTemplate con await y campaignUuid *****
                const emailHtml = await getWelcomeTemplate({
                    campaignUuid: campaignId, // Pasa el ID de la campaña
                    name: profileName || 'new member',
                    verificationToken: verificationToken,
                    baseUrl: baseUrl
                });

                // Solo enviar el email si se obtuvo el contenido del template
                if (emailHtml) {
                    await sendEmail({
                        fromEmailAddress: actualEmailFrom,
                        toEmailAddresses: [leadEmail],
                        subject: 'Welcome to Waro Labs! Please verify your email',
                        bodyHtml: emailHtml
                    });
                    console.log(`Verification email sent to ${leadEmail} from ${actualEmailFrom}`);
                } else {
                    console.warn(`No se pudo enviar el email de bienvenida a ${leadEmail} porque el template no se generó.`);
                }
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
            }
        }
        return responsePayload;
    } else if (associationStatus.includes('_association_existing')) {
        setResponseStatus(event, 409);
        responsePayload.message = 'Lead already associated with this campaign.';
        return responsePayload;
    } else {
        throw createError({
            statusCode: 500,
            statusMessage: 'Unexpected Status',
            message: 'An unexpected status was returned by the database function.',
            data: associationStatus
        });
    }
});