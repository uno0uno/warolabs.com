// server/api/marketing/createCampainMarketing.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';
import { authorize } from '../../utils/security/authorize';

export default defineEventHandler(async (event) => {
    if (event.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: 'This endpoint only accepts POST requests.' });
    }

    const body = await readBody(event);
    const { name, startDate, endDate, status, profileId } = body;

    if (!name || !startDate || !endDate || !status || !profileId) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing required parameters: name, startDate, endDate, status, profileId.' });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profileId)) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid profileId format. It must be a valid UUID.' });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid startDate or endDate format.' });
    }

    return await withPostgresClient(async (client) => {
        
        try {
            await verifyAuthToken(event);
        } catch (error) {
            throw error;
        }

        try {
            const query = `
                SELECT
                    (public.create_or_get_campaign(
                        $1::VARCHAR,                  -- p_campaign_name
                        $2::TIMESTAMP WITH TIME ZONE, -- p_campaign_start_date
                        $3::TIMESTAMP WITH TIME ZONE, -- p_campaign_end_date
                        $4::VARCHAR,                  -- p_campaign_status
                        $5::UUID                      -- p_campaign_profile_id
                    )).*
                AS campaign_data; 
            `; 
            const values = [
                name,
                parsedStartDate.toISOString(),
                parsedEndDate.toISOString(),
                status,
                profileId
            ]; //

            const result = await client.query(query, values); 

            const campaignId = result.rows[0].campaign_id;
            const campaignStatus = result.rows[0].status_message;

            if (campaignStatus === 'existing') {
                setResponseStatus(event, 409);
                return {
                    message: 'Campaign already exists.',
                    campaignId: campaignId,
                    status: campaignStatus
                };
            } else {
                setResponseStatus(event, 201);
                return {
                    message: 'Campaign created successfully.',
                    campaignId: campaignId,
                    status: campaignStatus
                };
            }
        } catch (pgError) {

            if (pgError.code === 'P0001') {
                let statusCode = 400;
                let friendlyMessage = pgError.message;

                if (pgError.message.includes('La campaña con ID') && pgError.message.includes('no existe')) {
                    statusCode = 404; // Not Found
                    friendlyMessage = 'The specified campaign does not exist in the database.';
                } else if (pgError.message.includes('Para crear un nuevo perfil') || pgError.message.includes('Missing or invalid profile data')) {
                    statusCode = 400; // Bad Request
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
});