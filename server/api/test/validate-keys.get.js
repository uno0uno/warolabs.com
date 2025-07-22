// server/api/test/validate-keys.get.js

import crypto from 'crypto';
import { createError } from 'h3';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';

// The parsePemKey function is kept here
function parsePemKey(key) {
    if (!key) {
        return undefined;
    }
    return key.replace(/\\n/g, '\n');
}

export default defineEventHandler(async (event) => {
    // === ADD THESE LINES TO DEBUG RAW ENVIRONMENT VARIABLES ===
    console.log('DEBUG: NUXT_PRIVATE_KEY_ENCRYPTER raw (from process.env):', process.env.NUXT_PRIVATE_KEY_ENCRYPTER ? 'Content present' : 'Undefined/Empty');
    console.log('DEBUG: NUXT_PUBLIC_KEY_ENCRYPTER raw (from process.env):', process.env.NUXT_PUBLIC_KEY_ENCRYPTER ? 'Content present' : 'Undefined/Empty');
    // =======================================================================


    try {
        await verifyAuthToken(event);
    } catch (error) {
        throw error;
    }

    try {
        const { public: { publicKeyEncrypter: rawPublicKey }, privateKeyEncrypter: rawPrivateKey } = useRuntimeConfig();

        if (!rawPublicKey || !rawPrivateKey) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Server Configuration Error',
                message: 'RSA Public and Private Keys must be configured in nuxt.config.ts and environment variables.'
            });
        }

        const publicKey = parsePemKey(rawPublicKey);
        const privateKey = parsePemKey(rawPrivateKey);

        console.log('DEBUG_KEY: Length of privateKey (parsed):', privateKey.length);
        console.log('DEBUG_KEY: privateKey starts with "BEGIN":', privateKey.startsWith('-----BEGIN PRIVATE KEY-----'));
        console.log('DEBUG_KEY: privateKey contains actual newlines (\\n):', privateKey.includes('\n'));
        console.log('DEBUG_KEY: First 100 characters of privateKey:\n', privateKey.substring(0, 100));

        console.log('DEBUG_KEY: Length of publicKey (parsed):', publicKey.length);
        console.log('DEBUG_KEY: publicKey starts with "BEGIN":', publicKey.startsWith('-----BEGIN PUBLIC KEY-----') || publicKey.startsWith('-----BEGIN RSA PUBLIC KEY-----'));
        console.log('DEBUG_KEY: publicKey contains actual newlines (\\n):', publicKey.includes('\n'));
        console.log('DEBUG_KEY: First 100 characters of publicKey:\n', publicKey.substring(0, 100));


        const testString = 'This is a test message to validate the RSA key pair.';

        // === ENCRYPTION (using OAEP Padding) ===
        const encryptedBuffer = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, // <--- CHANGE HERE
            },
            Buffer.from(testString, 'utf8')
        );
        const encryptedBase64 = encryptedBuffer.toString('base64');
        console.log('Key Validation: Original message:', testString);
        console.log('Key Validation: Encrypted (Base64):', encryptedBase64);

        // === DECRYPTION (using OAEP Padding) ===
        const decryptedBuffer = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, // <--- CHANGE HERE
            },
            Buffer.from(encryptedBase64, 'base64')
        );
        const decryptedString = decryptedBuffer.toString('utf8');
        console.log('Key Validation: Decrypted:', decryptedString);


        if (decryptedString === testString) {
            return {
                status: 'success',
                message: 'The RSA key pair is valid and works correctly for encryption/decryption with OAEP.',
                original: testString,
                encrypted: encryptedBase64,
                decrypted: decryptedString
            };
        } else {
            return {
                status: 'failure',
                message: 'Error: RSA key pair decryption does not match.',
                original: testString,
                decrypted: decryptedString
            };
        }

    } catch (error) {
        console.error('Error during key validation:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'RSA key pair validation failed.',
            data: { details: error.message }
        });
    }
});