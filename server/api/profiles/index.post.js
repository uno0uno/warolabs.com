// server/api/profiles.post.js

import { createClient } from '../../utils/basedataSettings/postgresConnection';
import { postgresErrorDictionary } from '../../utils/basedataSettings/postgresErrorMap';

export default defineEventHandler(async (event) => {
    if (event.method !== 'POST') {
        setResponseStatus(event, 405);
        return { error: 'Method Not Allowed', message: 'This endpoint only accepts POST requests.' };
    }

    const client = createClient();
    try {
        await client.connect();
        const body = await readBody(event);
        const { name, email, phone_number, nationality_id, enterprise, user_name, planet, country } = body;

        // Validaciones de entrada (ej. requeridos y formato de email)
        if (!email || !phone_number || !nationality_id) {
            setResponseStatus(event, 400);
            return { error: 'Bad Request', message: 'Missing required parameters: email, phone_number, nationality_id.' };
        }
        if (!email.includes('@') || !email.includes('.')) {
            setResponseStatus(event, 400);
            return { error: 'Bad Request', message: 'Invalid email format.' };
        }

        // Se asume que public.profile ya tiene un UUID por defecto (gen_random_uuid())
        const query = `
            INSERT INTO public.profile (name, email, phone_number, nationality_id, enterprise, user_name, planet, country)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, name, email;
        `;
        const values = [name || null, email, phone_number, nationality_id, enterprise || null, user_name || null, planet || null, country || null];

        const result = await client.query(query, values);
        
        setResponseStatus(event, 201); // Created
        return { profile: result.rows[0], message: 'Profile created successfully.' };

    } catch (error) {
        console.error('Error creating profile:', error);
        const errorInfo = postgresErrorDictionary[error.code] || postgresErrorDictionary.default;
        setResponseStatus(event, errorInfo.httpStatus);
        return {
            error: error.name || errorInfo.message,
            message: errorInfo.friendlyMessage,
            details: error.message
        };
    } finally {
        if (client) await client.end();
    }
});