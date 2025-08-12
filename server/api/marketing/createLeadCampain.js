// server/api/marketing/createLeadCampain.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';
import { sendEmail } from '../../utils/aws/sesClient'; 
import { getWelcomeTemplate } from '../../utils/emailTemplates/welcome.js';
import crypto from 'crypto';
import { createError } from 'h3';

export default defineEventHandler(async (event) => {
    if (event.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
    }

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
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing required parameters: campaignId and leadEmail.' });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(campaignId)) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid campaignId format.' });
    }

    if (!leadEmail.includes('@') || !leadEmail.includes('.')) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid leadEmail format.' });
    }
    
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const { leadId, profileId: associatedProfileId, associationStatus } = await withPostgresClient(async (client) => {
        try {
            await verifyAuthToken(event);
        } catch (error) {
            throw error;
        }

        try {
            const query = `
                SELECT
                    t.lead_return_id,
                    t.profile_return_id,
                    t.association_status
                FROM public.manage_lead_and_campaign_association($1::UUID, $2::VARCHAR, $3::VARCHAR, $4::VARCHAR, $5::VARCHAR, $6::INTEGER, $7::TEXT) AS t;
            `;
            const values = [campaignId, leadEmail, leadSource, profileName, profilePhoneNumber, profileNationalityId, verificationToken];
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
    
    const responsePayload = { leadId, profileId: associatedProfileId, status: associationStatus };

    if (associationStatus.includes('_association_created')) {
        setResponseStatus(event, 201);
        responsePayload.message = 'Lead successfully associated with campaign.';

        if (associationStatus.includes('lead_created')) {
            try {
                const { public: { baseUrl } } = useRuntimeConfig();

                const emailDetails = await getWelcomeTemplate({
                    campaignUuid: campaignId,
                    name: profileName || 'new member',
                    verificationToken,
                    baseUrl
                });

                if (emailDetails) {
                    const fromName = `${emailDetails.profileUserName} de ${emailDetails.enterprise}`;

                    await sendEmail({
                        fromName: fromName,
                        fromEmailAddress: emailDetails.sender,
                        toEmailAddresses: [leadEmail],
                        subject: emailDetails.subject,
                        bodyHtml: emailDetails.html
                    });

                    console.log(`Verification email sent to ${leadEmail} from "${fromName} <${emailDetails.sender}>"`);

                } else {
                    console.warn(`Could not send welcome email to ${leadEmail} because the template details could not be generated.`);
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