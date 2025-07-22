// server/api/test/encrypt-text.post.js

import crypto from 'crypto';
import { createError, defineEventHandler } from 'h3'; 
import { verifyAuthToken } from '../../utils/security/jwtVerifier';

export default defineEventHandler(async (event) => {

    if (event.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: 'This endpoint only accepts POST requests.' });
    }

    const body = await readBody(event);
    const { textToEncrypt } = body;

    try {
        await verifyAuthToken(event);
    } catch (error) {
        throw error;
    }

    if (!textToEncrypt) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing required parameter: textToEncrypt.' });
    }

    try {
        const { public: { publicKeyEncrypter } } = useRuntimeConfig();

        if (!publicKeyEncrypter) {
            throw createError({ statusCode: 500, statusMessage: 'Server Configuration Error', message: 'RSA Public Key is not configured on the server.' });
        }

        const encryptedBuffer = crypto.publicEncrypt(
            {
                key: publicKeyEncrypter,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            Buffer.from(textToEncrypt, 'utf8')
        );

        const encryptedBase64 = encryptedBuffer.toString('base64');

        return {
            encryptedText: encryptedBase64,
            message: 'Text encrypted successfully using server-side public key.'
        };

    } catch (error) {
        console.error('Error during server-side encryption:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'Failed to encrypt text using server-side public key.',
            data: { details: error.message }
        });
    }
});