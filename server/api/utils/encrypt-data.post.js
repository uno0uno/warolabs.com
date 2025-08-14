import { encryptWithPublicKey } from '~/server/utils/security/rsaEncryptor';
import { createError } from 'h3';

export default defineEventHandler(async (event) => {
    const { leadEmail } = await readBody(event);

    if (!leadEmail) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Missing required parameters: campaignId and leadEmail.'
        });
    }

    try {
        await verifyAuthToken(event);
    } catch (error) {
        throw error;
    }


    try {
        const encryptedLeadEmail = encryptWithPublicKey(leadEmail);
        
        return {
            encryptedLeadEmail
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'Failed to encrypt data.',
            data: { originalError: error.message }
        });
    }
});