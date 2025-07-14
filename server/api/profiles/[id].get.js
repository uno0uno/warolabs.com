// server/api/profiles/[id].get.js

// Import necessary utilities for database connection and error mapping.
import { createClient } from '../../utils/basedataSettings/postgresConnection';
import { postgresErrorDictionary } from '../../utils/basedataSettings/postgresErrorMap';

// Define the event handler for this API route.
export default defineEventHandler(async (event) => {
    // Ensure the request method is GET. If not, return a 405 Method Not Allowed error.
    if (event.method !== 'GET') {
        setResponseStatus(event, 405);
        return { error: 'Method Not Allowed', message: 'This endpoint only accepts GET requests.' };
    }

    // Extract the profile ID from the URL parameters.
    const profileId = event.context.params.id;

    // Validate the UUID format of the provided profile ID.
    // This regex ensures the ID is a valid UUID v4 format.
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profileId)) {
        setResponseStatus(event, 400); // Bad Request status
        return { error: 'Bad Request', message: 'Invalid profile ID format. It must be a valid UUID.' };
    }

    // Create a new PostgreSQL client instance.
    const client = createClient();
    try {
        // Connect to the PostgreSQL database.
        await client.connect();

        // Construct the SQL query to select a single profile by its ID.
        // Select only necessary and non-sensitive fields.
        const query = `
            SELECT
                id,
                name,
                email,
                phone_number,
                nationality_id,
                enterprise,
                user_name,
                created_at,
                planet,
                country,
                logo_avatar,
                description,
                website,
                status,
                city,
                banner,
                category,
                shadowban
            FROM public.profile
            WHERE id = $1;
        `;
        // Execute the query with the profileId as a parameter.
        const result = await client.query(query, [profileId]);

        // If no rows are returned, the profile was not found.
        if (result.rows.length === 0) {
            setResponseStatus(event, 404); // Not Found status
            return { error: 'Not Found', message: `Profile with ID ${profileId} not found.` };
        }

        // If a profile is found, return it.
        return { profile: result.rows[0] };

    } catch (error) {
        // Log the full error for debugging purposes on the server.
        console.error('Error fetching specific profile:', error);

        // Use the predefined error dictionary to get appropriate HTTP status and messages.
        const errorInfo = postgresErrorDictionary[error.code] || postgresErrorDictionary.default;
        setResponseStatus(event, errorInfo.httpStatus); // Set HTTP status based on error type.

        // Return a structured error response.
        return {
            error: error.name || errorInfo.message, // Use the error name or the dictionary's message.
            message: errorInfo.friendlyMessage,    // A user-friendly message.
            details: error.message                 // Original error message for more details.
        };
    } finally {
        // Ensure the database client connection is closed, regardless of success or failure.
        if (client) {
            await client.end();
        }
    }
});