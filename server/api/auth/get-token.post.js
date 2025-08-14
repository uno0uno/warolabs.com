import jwt from 'jsonwebtoken';
import { createError } from 'h3';

export default defineEventHandler(async (event) => {

    const { jwtSecret, tokenBackend } = useRuntimeConfig();

    if (!jwtSecret || !tokenBackend) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'JWT secret or backend token not configured.'
        });
    }

    const payload = {
        userId: "d2a3b4c5-e6f7-4890-a123-4567890abcde",
        role: "user",
        backendId: tokenBackend
    };

    try {

        const token = jwt.sign(payload, jwtSecret, { expiresIn: 60 });
        return { token };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'Failed to generate token.'
        });
    }
});