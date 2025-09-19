// server/api/profiles/[id].get.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation, addTenantFilterSimple } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
    const tenantContext = event.context.tenant;
    if (event.method !== 'GET') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: 'This endpoint only accepts GET requests.' });
    }

    const profileId = event.context.params.id;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profileId)) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid profile ID format. It must be a valid UUID.' });
    }

    return await withPostgresClient(async (client) => {
        console.log(`🔐 Obteniendo profile ${profileId} para tenant: ${tenantContext.tenant_name}`);

        const baseQuery = `
            SELECT
                p.id,
                p.name,
                p.email,
                p.phone_number,
                p.nationality_id,
                p.enterprise,
                p.user_name,
                p.created_at,
                p.planet,
                p.country,
                p.logo_avatar,
                p.description,
                p.website,
                p.status,
                p.city,
                p.banner,
                p.category,
                p.shadowban
            FROM public.profile p
            JOIN tenant_members tm ON p.id = tm.user_id
            WHERE p.id = $1
        `; 

        const { query, params } = addTenantFilterSimple(baseQuery, tenantContext, [profileId]);
        const result = await client.query(query, params);

        if (result.rows.length === 0) {
            throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Profile with ID ${profileId} not found.` });
        }

        return { profile: result.rows[0] };

    }, event); 
});