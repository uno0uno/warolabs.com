// server/api/profiles/index.get.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient'; // Importa la utilidad
import { verifyAuthToken } from '../../utils/security/jwtVerifier';

export default defineEventHandler(async (event) => {
    if (event.method !== 'GET') {
        setResponseStatus(event, 405);
        return { error: 'Method Not Allowed', message: 'This endpoint only accepts GET requests.' };
    }

    return await withPostgresClient(async (client) => {

        // try {
        //     await verifyAuthToken(event);
        // } catch (error) {
        //     throw error;
        // }

        const query = `
            SELECT id, name, email, phone_number, nationality_id, enterprise, user_name,
                   created_at, planet, country, logo_avatar, description, website,
                   status, city, banner, category, shadowban
            FROM public.profile;
        `;
        const result = await client.query(query); // Usa el 'client' proporcionado por withPostgresClient
        return { profiles: result.rows, count: result.rowCount };

    }, event); 
});