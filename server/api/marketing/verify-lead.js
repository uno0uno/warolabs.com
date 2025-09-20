import { createClient } from '../../utils/basedataSettings/postgresConnection';
import { postgresErrorDictionary } from '../../utils/basedataSettings/postgresErrorMap';

export default defineEventHandler(async (event) => {
    
    const query = getQuery(event);
    const token = query.token;
    const campaignId = query.campaignId;

    if (!token || typeof token !== 'string' || !campaignId || typeof campaignId !== 'string') {
        await sendRedirect(event, `/verification-failed?error=invalid_link`, 302);
        return;
    }

    console.log('Received verification token and campaign ID:', { token, campaignId });

    const client = createClient();
    let baseUrl = '';

    try {
        await client.connect();

        // Consulta unificada para verificar el token y la asociación de campaña
        // Esto previene que un token valide un lead para la campaña incorrecta
        const result = await client.query(
            `SELECT
                l.id AS lead_id,
                p.website
            FROM
                public.leads AS l
            JOIN
                public.campaign_leads AS cl ON l.id = cl.lead_id
            JOIN
                public.campaign AS c ON cl.campaign_id = c.id
            JOIN
                public.profile AS p ON c.profile_id = p.id
            WHERE
                l.verification_token = $1
                AND cl.campaign_id = $2`,
            [token, campaignId]
        );

        if (result.rowCount > 0) {
            console.log('Valid token and campaign ID found.');
            const leadId = result.rows[0].lead_id;
            baseUrl = result.rows[0].website;

            // Actualizar el lead una vez que la validación inicial es exitosa
            await client.query(
                `UPDATE public.leads
                 SET is_verified = true, verification_token = NULL 
                 WHERE id = $1`,
                [leadId]
            );

            console.log('Lead verified successfully. Redirecting to:', `${baseUrl}/verification-success`);
            await sendRedirect(event, `${baseUrl}/verification-success`, 302);

        } else {
            // No se encontraron coincidencias. El token puede ser inválido o ya fue usado.
            console.error('No matching lead found with the provided token and campaign ID.');
            const fallbackWebsiteResult = await client.query(
                `SELECT p.website
                 FROM public.campaign c
                 JOIN public.profile p ON c.profile_id = p.id
                 WHERE c.id = $1`,
                [campaignId]
            );

            if (fallbackWebsiteResult.rowCount > 0) {
                baseUrl = fallbackWebsiteResult.rows[0].website;
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
