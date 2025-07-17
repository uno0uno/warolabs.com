// server/api/profiles/[id].delete.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';

export default defineEventHandler(async (event) => {

    if (event.method !== 'DELETE') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: 'This endpoint only accepts DELETE requests.' });
    }

    const profileId = event.context.params.id;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profileId)) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid profile ID format. It must be a valid UUID.' });
    }

    return await withPostgresClient(async (client) => {

        try {
            await verifyAuthToken(event);
        } catch (error) {
            throw error;
        }

        try {
            const result = await client.query(
                `SELECT public.delete_profile($1::UUID) AS status_message`,
                [profileId]
            );

            setResponseStatus(event, 200);
            return { message: result.rows[0].status_message };

        } catch (pgError) {

            if (pgError.code === 'P0001') {
                let statusCode = 400; 
                let message = pgError.message; 

                if (message.includes('Profile with ID') && message.includes('not found')) {
                    statusCode = 404;
                } else if (message.includes('Cannot deactivate profile')) {
                    statusCode = 403; 
                }

                throw createError({
                    statusCode: statusCode,
                    statusMessage: message, 
                    message: message,      
                    data: { originalPgError: pgError.message }
                });
            } else {
                throw pgError;
            }
        }
    }, event);
});