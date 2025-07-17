// server/api/profiles/[id].get.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';

export default defineEventHandler(async (event) => {
    if (event.method !== 'GET') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: 'This endpoint only accepts GET requests.' });
    }

    const profileId = event.context.params.id;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profileId)) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid profile ID format. It must be a valid UUID.' });
    }

    return await withPostgresClient(async (client) => {

        // try {
        //     await verifyAuthToken(event);
        // } catch (error) {
        //     throw error;
        // }

        const query = `
            SELECT
                id,
                name,
                email,
                phone_number,
                nationality_id,
                enterprise,
                user_name,
                created_at,
                planet,
                country,
                logo_avatar,
                description,
                website,
                status,
                city,
                banner,
                category,
                shadowban
            FROM public.profile
            WHERE id = $1;
        `; 

        const result = await client.query(query, [profileId]);

        if (result.rows.length === 0) {
            throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Profile with ID ${profileId} not found.` });
        }

        return { profile: result.rows[0] };

    }, event); 
});