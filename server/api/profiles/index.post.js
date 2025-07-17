// server/api/profiles/index.post.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient'; // Importa la nueva utilidad

export default defineEventHandler(async (event) => {

    if (event.method !== 'POST') {
        setResponseStatus(event, 405);
        return { error: 'Method Not Allowed', message: 'This endpoint only accepts POST requests.' };
    }

    const body = await readBody(event);
    const { name, email, phone_number, nationality_id, enterprise, user_name, planet, country } = body;

    if (!email || !phone_number || !nationality_id) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing required parameters: email, phone_number, nationality_id.' });
    }
    if (!email.includes('@') || !email.includes('.')) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid email format.' });
    }


    try {
        await verifyAuthToken(event);
    } catch (error) {
        throw error;
    }


    return await withPostgresClient(async (client) => {
        const query = `
            INSERT INTO public.profile (name, email, phone_number, nationality_id, enterprise, user_name, planet, country)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, name, email;
        `; //
        const values = [name || null, email, phone_number, nationality_id, enterprise || null, user_name || null, planet || null, country || null];

        const result = await client.query(query, values);
        

        return { profile: result.rows[0], message: 'Profile created successfully.' };

    }, event);
});