// server/api/profiles/index.get.js

import { createClient } from '../../utils/basedataSettings/postgresConnection';
import { postgresErrorDictionary } from '../../utils/basedataSettings/postgresErrorMap';

export default defineEventHandler(async (event) => {
    if (event.method !== 'GET') {
        setResponseStatus(event, 405);
        return { error: 'Method Not Allowed', message: 'This endpoint only accepts GET requests.' };
    }

    const client = createClient();
    try {
        await client.connect();

        // Consulta para seleccionar todos los perfiles
        // Se excluyen campos sensibles como la contraseña si existiera
        // Puedes ajustar los campos que deseas retornar
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
            FROM public.profile;
        `;
        const result = await client.query(query);

        return { profiles: result.rows, count: result.rowCount };

    } catch (error) {
        console.error('Error fetching all profiles:', error);
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