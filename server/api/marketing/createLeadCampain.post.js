// server/api/marketing/createLeadCampain.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';
import { sendEmail } from '../../utils/aws/sesClient'; 
import { getWelcomeTemplate } from '../../utils/emailTemplates/welcome.js';
import crypto from 'crypto';
import { createError } from 'h3';
import { decryptWithPrivateKey } from '../../utils/security/rsaEncryptor.js';

export default defineEventHandler(async (event) => {
    if (event.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
    }

    const body = await readBody(event);
    const {
        encryptedCampaignId,
        encryptedLeadEmail,
        leadSource,
        profileName,
        profilePhoneNumber,
        profileNationalityId,
        profilePhoneCountryCode
    } = body;

    let campaignId, leadEmail;
    try {
        campaignId = decryptWithPrivateKey(encryptedCampaignId);
        leadEmail = decryptWithPrivateKey(encryptedLeadEmail);

    } catch (error) {
        throw error;
    }

    if (!campaignId || !leadEmail) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing required parameters after decryption.' });
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
        // Comentado temporalmente para pruebas
        // try {
        //     await verifyAuthToken(event);
        // } catch (error) {
        //     throw error;
        // }
        try {

            const query = `
                SELECT
                    t.lead_return_id,
                    t.profile_return_id,
                    t.association_status
                FROM public.manage_lead_and_campaign_association($1::UUID, $2::VARCHAR, $3::VARCHAR, $4::VARCHAR, $5::VARCHAR, $6::VARCHAR, $7::INTEGER, $8::TEXT) AS t;
            `; 
            const values = [campaignId, leadEmail, leadSource, profileName, profilePhoneNumber, profilePhoneCountryCode, profileNationalityId, verificationToken];
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

                if (pgError.message.includes('The specified campaign does not exist.')) {
                    statusCode = 404;
                    friendlyMessage = 'The specified campaign does not exist.';
                } else if (pgError.message.includes('To create a new profile') || pgError.message.includes('Missing or invalid profile data')) {
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
        
        // Track lead interaction
        try {
            await withPostgresClient(async (client) => {
                // Get request details for tracking
                const headers = event.node?.req?.headers || event.req?.headers || {};
                const userAgent = headers['user-agent'] || null;
                const ipAddress = headers['x-forwarded-for']?.split(',')[0] || 
                               headers['x-real-ip'] || 
                               event.node?.req?.socket?.remoteAddress || 
                               null;
                const referrer = headers['referer'] || headers['referrer'] || null;
                
                // Parse UTM parameters if they exist in the request
                const query = getQuery(event);
                
                const insertQuery = `
                    INSERT INTO lead_interactions (
                        lead_id,
                        interaction_type,
                        source,
                        medium,
                        campaign_id,
                        term,
                        content,
                        referrer_url,
                        ip_address,
                        user_agent,
                        metadata
                    )
                    VALUES ($1, $2, $3, $4, $5::uuid, $6, $7, $8, $9::inet, $10, $11::jsonb)
                `;
                
                const values = [
                    leadId,
                    'lead_capture',
                    query.utm_source || leadSource || 'api',
                    query.utm_medium || null,
                    campaignId, // Ahora es UUID directo
                    query.utm_term || null,
                    query.utm_content || null,
                    referrer,
                    ipAddress,
                    userAgent,
                    JSON.stringify({
                        profile_id: associatedProfileId,
                        lead_source: leadSource,
                        email: leadEmail,
                        name: profileName,
                        created_via: 'createLeadCampain_api',
                        utm_campaign: query.utm_campaign || null
                    })
                ];
                
                await client.query(insertQuery, values);
                console.log(`Lead interaction tracked for lead ${leadId}`);
            }, event);
        } catch (trackingError) {
            // Log error but don't fail the main request
            console.error('Failed to track lead interaction:', trackingError);
        }

        try {
            const { public: { baseUrl } } = useRuntimeConfig();
            const host = event.node?.req?.headers?.host || event.req?.headers?.host;
            
            // Generate unique email send ID for tracking
            const emailSendId = crypto.randomUUID();
            
            const emailDetails = await getWelcomeTemplate({
                campaignUuid: campaignId,
                name: profileName || 'new member',
                verificationToken,
                host,
                // Add tracking parameters
                leadId: leadId,
                emailSendId: emailSendId
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

                console.log(`Verification email sent to ${leadEmail} from "${fromName} <${emailDetails.sender}>" with tracking ID: ${emailSendId}`);

                // Register email_sent interaction
                try {
                    await withPostgresClient(async (client) => {
                        const emailSentQuery = `
                            INSERT INTO lead_interactions (
                                lead_id,
                                interaction_type,
                                source,
                                medium,
                                campaign_id,
                                metadata,
                                interaction_context
                            )
                            VALUES ($1::uuid, $2, $3, $4, $5::uuid, $6::jsonb, $7)
                        `;
                        
                        await client.query(emailSentQuery, [
                            leadId,
                            'email_sent',
                            'verification_email',
                            'email',
                            campaignId,
                            JSON.stringify({
                                email_send_id: emailSendId,
                                subject: emailDetails.subject,
                                sender: emailDetails.sender,
                                verification_token: verificationToken,
                                status: 'sent'
                            }),
                            'email_engagement'
                        ]);
                        
                        console.log(`✅ Email sent interaction tracked for lead ${leadId} with send ID: ${emailSendId}`);
                    }, event);
                } catch (trackingError) {
                    console.error('Failed to track email_sent interaction:', trackingError);
                }

            } else {
                console.warn(`Could not send welcome email to ${leadEmail} because the template details could not be generated.`);
            }
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }
        return responsePayload;

    } else if (associationStatus.includes('_association_existing')) {
        setResponseStatus(event, 409);
        responsePayload.message = 'Ya estás inscrito con este correo electrónico.';
        return responsePayload;
    } else {
        throw createError({
            statusCode: 500,
            statusMessage: 'Unexpected Status',
            message: 'Tenemos problemas en este momento, intenta más tarde.',
            data: associationStatus
        });
    }
});