import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { createError, defineEventHandler, getRouterParam } from 'h3';
import { encryptWithPublicKey } from '../../utils/security/rsaEncryptor.js';
import { verifyAuthToken } from '../../utils/security/jwtVerifier.js';

export default defineEventHandler(async (event) => {

    const slug = getRouterParam(event, 'slug');

    if (!slug) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Missing slug parameter in URL.'
        });
    }

    try {
        await verifyAuthToken(event);
    } catch (error) {
        console.error('Authentication error in landing page endpoint:', error);
        throw error;
    }

    try {
        let landingPageData = null;

        await withPostgresClient(async (client) => {
            
            const query = `
                SELECT
                    tv.content as template_content,
                    c.id as campaign_id,
                    p.enterprise as enterprise_name,
                    p.user_name as creator_name
                FROM
                    public.campaign AS c
                JOIN
                    public.profile AS p ON c.profile_id = p.id
                JOIN
                    public.campaign_template_versions AS ctv ON c.id = ctv.campaign_id
                JOIN
                    public.template_versions AS tv ON ctv.template_version_id = tv.id
                JOIN
                    public.templates AS t ON tv.template_id = t.id
                WHERE
                    c.slug = $1 
                    AND t.template_type = 'landing'
                    AND ctv.is_active = true
                ORDER BY
                    tv.created_at DESC, tv.version_number DESC
                LIMIT 1;
            `;

            const result = await client.query(query, [slug]);
            
            if (result.rows.length > 0) {
                const row = result.rows[0];
                const contentJson = JSON.parse(row.template_content);

                const encryptedCampaignId = encryptWithPublicKey(row.campaign_id);

                landingPageData = {
                    ...contentJson,
                    campaignId: encryptedCampaignId,
                    enterprise: row.enterprise_name,
                    creator: row.creator_name,
                    slug: slug
                };
            }
        });

        if (!landingPageData) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Not Found',
                message: `No landing page template found for slug: '${slug}'.`
            });
        }

        return landingPageData;
    } catch (error) {
        console.error('Error in dynamic landing page endpoint:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Internal Server Error',
            message: error.message || 'An unexpected error occurred while fetching the landing page.',
            data: { originalError: error.message }
        });
    }
});