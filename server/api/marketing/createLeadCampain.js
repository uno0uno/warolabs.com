// server/api/marketing/createLeadCampain.js

import { createClient } from '../../utils/basedataSettings/postgresConnection';
import { postgresErrorDictionary } from '../../utils/basedataSettings/postgresErrorMap';
import { sendEmail } from '../../utils/aws/sesClient';
import { getWelcomeTemplate } from '../../utils/emailTemplates/welcome.js';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
    if (event.method !== 'POST') {
        setResponseStatus(event, 405);
        return { error: 'Method Not Allowed', message: 'This endpoint only accepts POST requests.' };
    }

    const client = createClient();

    try {
        await client.connect();

        const body = await readBody(event);
        const {
            campaignId,
            leadEmail,
            leadSource,
            profileName,
            profilePhoneNumber,
            profileNationalityId
        } = body;

        if (!campaignId || !leadEmail) {
            setResponseStatus(event, 400);
            return { error: 'Bad Request', message: 'Missing required parameters: campaignId, leadEmail.' };
        }

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(campaignId)) {
            setResponseStatus(event, 400);
            return { error: 'Bad Request', message: 'Invalid campaignId format. It must be a valid UUID.' };
        }

        if (!leadEmail.includes('@') || !leadEmail.includes('.')) {
            setResponseStatus(event, 400);
            return { error: 'Bad Request', message: 'Invalid leadEmail format.' };
        }

        // Generar un token de verificación único
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // IMPORTANTE: Debes modificar tu función de PostgreSQL 'manage_lead_and_campaign_association'
        // para que acepte un 7º parámetro (p_verification_token TEXT) y lo inserte
        // en la nueva columna 'verification_token' de la tabla 'leads'.
        const query = `
            SELECT
                t.lead_return_id,
                t.profile_return_id,
                t.association_status
            FROM public.manage_lead_and_campaign_association(
                $1::UUID,      -- p_campaign_id
                $2::VARCHAR,   -- p_lead_email
                $3::VARCHAR,   -- p_lead_source
                $4::VARCHAR,   -- p_profile_name
                $5::VARCHAR,   -- p_profile_phone_number
                $6::INTEGER,   -- p_profile_nationality_id
                $7::TEXT       -- p_verification_token
            ) AS t;
        `;
        const values = [
            campaignId,
            leadEmail,
            leadSource || null,
            profileName || null,
            profilePhoneNumber || null,
            profileNationalityId || null,
            verificationToken // Pasar el nuevo token
        ];

        const result = await client.query(query, values);

        const leadId = result.rows[0].lead_return_id;
        const associatedProfileId = result.rows[0].profile_return_id;
        const associationStatus = result.rows[0].association_status;

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
                    const {  emailFrom, public: { baseUrl } } = useRuntimeConfig();

                    const emailHtml = getWelcomeTemplate({
                        name: profileName || 'new member',
                        verificationToken: verificationToken,
                        baseUrl: baseUrl 
                    });

                    await sendEmail({
                        fromEmailAddress: emailFrom,
                        toEmailAddresses: [leadEmail],
                        subject: 'Welcome to Waro Labs! Please verify your email',
                        bodyHtml: emailHtml
                    });
                    console.log(`Verification email sent to ${leadEmail}`);
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
            setResponseStatus(event, 500);
            return {
                error: 'Unexpected Status',
                message: 'An unexpected status was returned by the database function.',
                details: associationStatus
            };
        }
    } catch (error) {
        console.error('Error managing lead and campaign association:', error);
        const errorInfo = postgresErrorDictionary[error.code] || postgresErrorDictionary.default;
        setResponseStatus(event, errorInfo.httpStatus);
        return {
            error: error.name || errorInfo.message,
            message: errorInfo.friendlyMessage,
            details: error.message
        };
    } finally {
        if (client) {
            await client.end();
        }
    }
});