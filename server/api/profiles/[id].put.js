// server/api/profiles/[id].put.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';

export default defineEventHandler(async (event) => {
    if (event.method !== 'PUT') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: 'This endpoint only accepts PUT requests.' });
    }

    const profileId = event.context.params.id;
    const body = await readBody(event);

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profileId)) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid profile ID format. It must be a valid UUID.' });
    }

    if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'No fields provided for update in the request body.' });
    }

    const {
        name, email, phone_number, nationality_id, enterprise, user_name,
        planet, country, logo_avatar, description, website, status,
        city, banner, category, shadowban
    } = body;

    return await withPostgresClient(async (client) => {

        try {
            await verifyAuthToken(event);
        } catch (error) {
            throw error;
        }

        const updates = []; 
        const values = [profileId]; 
        let paramIndex = 2; 

        if (name !== undefined) { updates.push(`name = $${paramIndex++}`); values.push(name); }
        if (email !== undefined) { updates.push(`email = $${paramIndex++}`); values.push(email); }
        if (phone_number !== undefined) { updates.push(`phone_number = $${paramIndex++}`); values.push(phone_number); }
        if (nationality_id !== undefined) { updates.push(`nationality_id = $${paramIndex++}`); values.push(nationality_id); }
        if (enterprise !== undefined) { updates.push(`enterprise = $${paramIndex++}`); values.push(enterprise); }
        if (user_name !== undefined) { updates.push(`user_name = $${paramIndex++}`); values.push(user_name); }
        if (planet !== undefined) { updates.push(`planet = $${paramIndex++}`); values.push(planet); }
        if (country !== undefined) { updates.push(`country = $${paramIndex++}`); values.push(country); }
        if (logo_avatar !== undefined) { updates.push(`logo_avatar = $${paramIndex++}`); values.push(logo_avatar); }
        if (description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(description); }
        if (website !== undefined) { updates.push(`website = $${paramIndex++}`); values.push(website); }
        if (status !== undefined) { updates.push(`status = $${paramIndex++}`); values.push(status); }
        if (city !== undefined) { updates.push(`city = $${paramIndex++}`); values.push(city); }
        if (banner !== undefined) { updates.push(`banner = $${paramIndex++}`); values.push(banner); }
        if (category !== undefined) { updates.push(`category = $${paramIndex++}`); values.push(category); }
        if (shadowban !== undefined) { updates.push(`shadowban = $${paramIndex++}`); values.push(shadowban); }

        if (updates.length === 0) {
            throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'No valid fields provided for update.' });
        }

        const query = `
            UPDATE public.profile
            SET ${updates.join(', ')}, updated_at = NOW()
            WHERE id = $1
            RETURNING id, name, email;
        `;

        const result = await client.query(query, values);

        if (result.rowCount === 0) {
            throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Profile with ID ${profileId} not found.` });
        }

        return { profile: result.rows[0], message: 'Profile updated successfully.' };

    }, event); 
});