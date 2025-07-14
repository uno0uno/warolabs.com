// server/api/profiles/[id].put.js

// Import necessary utilities for database connection and error mapping.
import { createClient } from '../../utils/basedataSettings/postgresConnection';
import { postgresErrorDictionary } from '../../utils/basedataSettings/postgresErrorMap';

// Define the event handler for this API route.
export default defineEventHandler(async (event) => {
    // Ensure the request method is PUT. If not, return a 405 Method Not Allowed error.
    if (event.method !== 'PUT') {
        setResponseStatus(event, 405);
        return { error: 'Method Not Allowed', message: 'This endpoint only accepts PUT requests.' };
    }

    // Extract the profile ID from the URL parameters.
    const profileId = event.context.params.id;
    // Read the request body, which contains the fields to update.
    const body = await readBody(event);

    // Destructure all possible fields from the body.
    // Use 'undefined' as default to check if a field was explicitly sent in the body.
    const {
        name, email, phone_number, nationality_id, enterprise, user_name,
        planet, country, logo_avatar, description, website, status,
        city, banner, category, shadowban
    } = body;

    // Validate the UUID format of the provided profile ID.
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

        // Initialize arrays to build the dynamic SQL query.
        const updates = []; // Stores "column = $index" clauses
        const values = [profileId]; // Stores the values for the parameters, starting with the ID for WHERE clause
        let paramIndex = 2; // Start parameter index from $2 (since $1 is for profileId)

        // Conditionally add fields to the update query if they are present in the request body.
        // This allows for partial updates.
        if (name !== undefined) { updates.push(`name = $${paramIndex++}`); values.push(name); }
        if (email !== undefined) { updates.push(`email = $${paramIndex++}`); values.push(email); }
        if (phone_number !== undefined) { updates.push(`phone_number = $${paramIndex++}`); values.push(phone_number); }
        if (nationality_id !== undefined) { updates.push(`nationality_id = $${paramIndex++}`); values.push(nationality_id); }
        if (enterprise !== undefined) { updates.push(`enterprise = $${paramIndex++}`); values.push(enterprise); }
        if (user_name !== undefined) { updates.push(`user_name = $${paramIndex++}`); values.push(user_name); }
        if (planet !== undefined) { updates.push(`planet = $${paramIndex++}`); values.push(planet); }
        if (country !== undefined) { updates.push(`country = $${paramIndex++}`); values.push(country); }
        if (logo_avatar !== undefined) { updates.push(`logo_avatar = $${paramIndex++}`); values.push(logo_avatar); }
        if (description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(description); }
        if (website !== undefined) { updates.push(`website = $${paramIndex++}`); values.push(website); }
        if (status !== undefined) { updates.push(`status = $${paramIndex++}`); values.push(status); }
        if (city !== undefined) { updates.push(`city = $${paramIndex++}`); values.push(city); }
        if (banner !== undefined) { updates.push(`banner = $${paramIndex++}`); values.push(banner); }
        if (category !== undefined) { updates.push(`category = $${paramIndex++}`); values.push(category); }
        if (shadowban !== undefined) { updates.push(`shadowban = $${paramIndex++}`); values.push(shadowban); }

        // If no fields were provided for update, return a Bad Request error.
        if (updates.length === 0) {
            setResponseStatus(event, 400);
            return { error: 'Bad Request', message: 'No fields provided for update.' };
        }

        // Construct the final SQL UPDATE query.
        // The RETURNING clause fetches the updated ID, name, and email.
        const query = `
            UPDATE public.profile
            SET ${updates.join(', ')}
            WHERE id = $1
            RETURNING id, name, email;
        `;

        // Execute the update query.
        const result = await client.query(query, values);

        // If no rows were affected, it means the profile with the given ID was not found.
        if (result.rowCount === 0) {
            setResponseStatus(event, 404); // Not Found status
            return { error: 'Not Found', message: `Profile with ID ${profileId} not found.` };
        }

        // Return the updated profile's basic info and a success message.
        return { profile: result.rows[0], message: 'Profile updated successfully.' };

    } catch (error) {
        // Log the full error for debugging purposes on the server.
        console.error('Error updating profile:', error);

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
        // Ensure the database client connection is closed.
        if (client) {
            await client.end();
        }
    }
});