import { createClient } from '../../utils/basedataSettings/postgresConnection';
import { postgresErrorDictionary } from '../../utils/basedataSettings/postgresErrorMap';

export default defineEventHandler(async (event) => {
    
    const query = getQuery(event);
    const token = query.token;

    if (!token || typeof token !== 'string') {
        await sendRedirect(event, `/verification-failed?error=invalid_token`, 302);
        return;
    }

    const client = createClient();
    let baseUrl = '';

    try {
        await client.connect();
        const result = await client.query(
            `UPDATE public.leads l
             SET is_verified = true, verification_token = NULL 
             FROM public.profile p
             WHERE l.verification_token = $1 AND l.is_verified = false AND l.profile_id = p.id
             RETURNING p.website`,
            [token]
        );
        
        if (result.rowCount > 0) {
            baseUrl = result.rows[0].website;
            await sendRedirect(event, `${baseUrl}/verification-success`, 302);
        } else {
            const websiteResult = await client.query(
                `SELECT p.website
                 FROM public.leads l
                 JOIN public.profile p ON l.profile_id = p.id
                 WHERE l.verification_token = $1`,
                [token]
            );

            if (websiteResult.rowCount > 0) {
                baseUrl = websiteResult.rows[0].website;
                await sendRedirect(event, `${baseUrl}/verification-failed?error=expired_link`, 302);
            } else {
                await sendRedirect(event, `/verification-failed?error=expired_link`, 302);
            }
        }

    } catch (error) {
        console.error('Error during email verification:', error);
        const fallbackUrl = baseUrl ? `${baseUrl}/verification-failed?error=server_error` : `/verification-failed?error=server_error`;
        await sendRedirect(event, fallbackUrl, 302);
    } finally {
        if (client) {
            await client.end();
        }
    }
});