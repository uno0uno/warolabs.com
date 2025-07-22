// server/api/test/encrypt-text.post.js

import crypto from 'crypto';
import { createError } from 'h3';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';
import { parsePemKey } from '../../utils/commons/keyParser.js';


export default defineEventHandler(async (event) => {
    // Ensure the request method is POST
    if (event.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: 'This endpoint only accepts POST requests.' });
    }

    // Read the request body
    const body = await readBody(event);
    const { textToEncrypt } = body;

    // Verify authentication token
    try {
        await verifyAuthToken(event);
    } catch (error) {
        throw error; // Re-throw the error if token verification fails
    }

    // Check if the required 'textToEncrypt' parameter is present
    if (!textToEncrypt) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Missing required parameter: textToEncrypt.' });
    }

    try {
        // Access the public key from the runtime configuration
        const { public: { publicKeyEncrypter } } = useRuntimeConfig();

        // If the public key is not configured, throw a server error
        if (!publicKeyEncrypter) {
            throw createError({ statusCode: 500, statusMessage: 'Server Configuration Error', message: 'RSA Public Key is not configured on the server.' });
        }

        // === IMPORTANT: Parse the public key to handle newlines ===
        const parsedPublicKey = parsePemKey(publicKeyEncrypter);

        // ==========================================================
        // === ADD THESE DEBUGGING LINES HERE (before crypto.publicEncrypt) ===
        // ==========================================================
        console.log('DEBUG_KEY: Length of parsedPublicKey:', parsedPublicKey.length);
        console.log('DEBUG_KEY: parsedPublicKey starts with "BEGIN":', parsedPublicKey.startsWith('-----BEGIN PUBLIC KEY-----'));
        console.log('DEBUG_KEY: parsedPublicKey contains actual newlines (\\n):', parsedPublicKey.includes('\n'));
        console.log('DEBUG_KEY: First 100 characters of parsedPublicKey:\n', parsedPublicKey.substring(0, 100));
        console.log('DEBUG_KEY: Last 100 characters of parsedPublicKey:\n', parsedPublicKey.substring(parsedPublicKey.length - 100));
        // ==========================================================

        // Encrypt the text using the public key and OAEP padding
        const encryptedBuffer = crypto.publicEncrypt(
            {
                key: parsedPublicKey, // <--- Use the PARSED public key here!
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, // <--- Important: same padding as decryption
            },
            Buffer.from(textToEncrypt, 'utf8') // Convert the text to a UTF-8 Buffer
        );

        // Convert the encrypted result to Base64 for transmission
        const encryptedBase64 = encryptedBuffer.toString('base64');

        // Return the encrypted text and a success message
        return {
            encryptedText: encryptedBase64,
            message: 'Text encrypted successfully using server-side public key.'
        };

    } catch (error) {
        // Log any errors that occur during server-side encryption
        console.error('Error during server-side encryption:', error);
        // Throw a server error with details
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'Failed to encrypt text using server-side public key.',
            data: { details: error.message }
        });
    }
});