import crypto from 'crypto';
import { createError } from 'h3';
import { parsePemKey } from '../commons/keyParser.js';



export function encryptWithPublicKey(text) {

    const { public: { publicKeyEncrypter } } = useRuntimeConfig();

    if (!text) return null;
    if (!publicKeyEncrypter) {
        throw createError({ statusCode: 500, statusMessage: 'Server Configuration Error', message: 'RSA Public Key is not configured.' });
    }
    try {
        const parsedPublicKey = parsePemKey(publicKeyEncrypter);
        const encryptedBuffer = crypto.publicEncrypt(
            {
                key: parsedPublicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            Buffer.from(text, 'utf8')
        );
        return encryptedBuffer.toString('base64');
    } catch (error) {
        throw createError({ statusCode: 500, statusMessage: 'Encryption Error', message: 'Failed to encrypt text.', data: { details: error.message } });
    }
}

export function decryptWithPrivateKey(encryptedBase64Text) {

    const { privateKeyEncrypter } = useRuntimeConfig();

    if (!encryptedBase64Text) return null;
    if (!privateKeyEncrypter) {
        throw createError({ statusCode: 500, statusMessage: 'Server Configuration Error', message: 'RSA Private Key is not configured.' });
    }
    try {
        const parsedPrivateKey = parsePemKey(privateKeyEncrypter);
        const decryptedBuffer = crypto.privateDecrypt(
            {
                key: parsedPrivateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            Buffer.from(encryptedBase64Text, 'base64')
        );
        return decryptedBuffer.toString('utf8');
    } catch (error) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid encrypted data provided.', data: { details: error.message } });
    }
}