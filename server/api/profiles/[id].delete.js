// server/api/profiles/[id].delete.js

// Import necessary utilities for database connection and error mapping.
import { createClient } from '../../utils/basedataSettings/postgresConnection'; //
import { postgresErrorDictionary } from '../../utils/basedataSettings/postgresErrorMap'; //

// Define the event handler for this API route.
export default defineEventHandler(async (event) => {
    // Ensure the request method is DELETE. If not, return a 405 Method Not Allowed error.
    if (event.method !== 'DELETE') {
        setResponseStatus(event, 405);
        return { error: 'Method Not Allowed', message: 'This endpoint only accepts DELETE requests.' };
    }

    // Extract the profile ID from the URL parameters.
    const profileId = event.context.params.id;

    // Validate the UUID format of the provided profile ID.
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profileId)) {
        setResponseStatus(event, 400); // Bad Request status
        return { error: 'Bad Request', message: 'Invalid profile ID format. It must be a valid UUID.' };
    }

    // Create a new PostgreSQL client instance.
    const client = createClient(); //
    try {
        // Connect to the PostgreSQL database.
        await client.connect();

        // Call the PostgreSQL function to handle the deletion with all its internal checks.
        // The function is expected to return a TEXT message.
        const result = await client.query(
            `SELECT public.delete_profile_final($1::UUID) AS status_message`,
            [profileId]
        );

        // If the function returns successfully, set status to 200 OK
        // The message from the PG function is returned.
        setResponseStatus(event, 200);
        return { message: result.rows[0].status_message };

    } catch (error) {
        // Log the full error for debugging purposes on the server.
        console.error('Error deleting profile via PG function:', error);

        // Determine the HTTP status and message based on the error.
        let errorInfo = postgresErrorDictionary[error.code] || postgresErrorDictionary.default; //

        // Special handling for PL/pgSQL RAISE EXCEPTION errors (PostgreSQL error code P0001).
        // These are custom errors raised by your database function.
        if (error.code === 'P0001') {
            // Set a specific HTTP status, e.g., 400 Bad Request for business logic violations.
            errorInfo.httpStatus = 400;
            errorInfo.friendlyMessage = error.message; // Use the exact message from the PG exception for clarity.
        }

        setResponseStatus(event, errorInfo.httpStatus); // Set HTTP status based on error type.

        // Return a structured error response.
        return {
            error: error.name || errorInfo.message, // Use the error name or the dictionary's message.
            message: errorInfo.friendlyMessage,    // A user-friendly message.
            details: error.message                 // Original error message (e.g., from PG) for more details.
        };
    } finally {
        // Ensure the database client connection is closed.
        if (client) {
            await client.end();
        }
    }
});