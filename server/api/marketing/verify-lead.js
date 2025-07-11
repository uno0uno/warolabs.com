// server/api/marketing/verify-lead.js

import { createClient } from '../../utils/basedataSettings/postgresConnection';
import { postgresErrorDictionary } from '../../utils/basedataSettings/postgresErrorMap';

export default defineEventHandler(async (event) => {
    
    const {  public: { baseUrl } } = useRuntimeConfig();
    
    const query = getQuery(event);
    const token = query.token;

    if (!token || typeof token !== 'string') {
        // Redirige a una página de error si no hay token
        await sendRedirect(event, `${baseUrl}verification-failed?error=invalid_token`, 302);
        return;
    }

    const client = createClient();
    try {
        await client.connect();

        // Actualiza el lead, lo marca como verificado y elimina el token para que no se pueda volver a usar.
        const result = await client.query(
            `UPDATE public.leads 
             SET is_verified = true, verification_token = NULL 
             WHERE verification_token = $1 AND is_verified = false
             RETURNING id`,
            [token]
        );
        
        // Si una fila fue afectada, la verificación fue exitosa.
        if (result.rowCount > 0) {
            // Redirige al usuario a una página de éxito
            await sendRedirect(event, `${baseUrl}verification-success`, 302);
        } else {
            // El token no es válido o ya fue usado.
            await sendRedirect(event, `${baseUrl}verification-failed?error=expired_link`, 302);
        }

    } catch (error) {
        console.error('Error during email verification:', error);
        // En caso de error de servidor, redirige a una página de error genérica.
        await sendRedirect(event, `${baseUrl}verification-failed?error=server_error`, 302);
    } finally {
        if (client) {
            await client.end();
        }
    }
});