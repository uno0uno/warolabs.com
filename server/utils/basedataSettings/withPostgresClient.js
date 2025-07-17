// server/utils/basedataSettings/withPostgresClient.js

import { createClient } from './postgresConnection';
import { postgresErrorDictionary } from './postgresErrorMap';

/**
 * Wrapper para gestionar la conexión y desconexión de PostgreSQL,
 * y el manejo de errores comunes de la base de datos.
 *
 * @param {Function} callback Una función asíncrona que recibe el cliente de PostgreSQL conectado.
 * @param {object} event El objeto de evento de H3/Nitro, necesario para createError.
 * @returns {Promise<any>} El resultado de la función callback.
 */
export async function withPostgresClient(callback, event) {
    const client = createClient();
    try {
        await client.connect();
        const result = await callback(client);
        return result;
    } catch (error) {
        console.error('Database operation failed:', error); // Log interno del error

        let h3ErrorToThrow; // <--- ¡DECLARACIÓN DE LA VARIABLE AQUÍ!

        // 1. PRIORIDAD: Si el error YA es un H3Error (ej. de verifyAuthToken, authorize)
        if (error.statusCode && error.statusMessage) {
            h3ErrorToThrow = createError({ // Asignación
                statusCode: error.statusCode,
                statusMessage: error.statusMessage,
                message: error.message,
                data: error.data
            });

        }

        // 2. Manejar ERRORES ESPECÍFICOS DE POSTGRESQL
        else if (error.code && postgresErrorDictionary[error.code]) {
            const errorInfo = postgresErrorDictionary[error.code];
            h3ErrorToThrow = createError({ // Asignación
                statusCode: errorInfo.httpStatus,
                statusMessage: errorInfo.statusMessage,
                message: errorInfo.statusMessage,
                data: {
                    errorCode: error.code,
                    friendlyMessage: errorInfo.friendlyMessage,
                    originalDbMessage: error.message,
                    dbDetail: error.detail,
                    dbHint: error.hint
                }
            });
        }
        // 3. Fallback para CUALQUIER otro error inesperado
        else {
            const defaultErrorInfo = postgresErrorDictionary.default;
            h3ErrorToThrow = createError({ // Asignación
                statusCode: defaultErrorInfo.httpStatus,
                statusMessage: defaultErrorInfo.statusMessage,
                message: defaultErrorInfo.statusMessage,
                data: {
                    originalErrorName: error.name,
                    originalErrorMessage: error.message,
                    stack: error.stack
                }
            });
        }

        // Finalmente, lanzar el H3Error construido
        throw h3ErrorToThrow; // Ahora 'h3ErrorToThrow' siempre estará definida aquí

    } finally {
        if (client) {
            await client.end();
        }
    }
}