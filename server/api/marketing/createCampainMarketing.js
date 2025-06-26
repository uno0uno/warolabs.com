// server/api/campaign/create.ts

import { createClient } from '../../utils/basedataSettings/postgresConnection';
import { postgresErrorDictionary } from '../../utils/basedataSettings/postgresErrorMap'; // Import the error dictionary

export default defineEventHandler(async (event) => {
    // Ensure the request method is POST
    if (event.method !== 'POST') {
        setResponseStatus(event, 405); // Method Not Allowed
        return {
            error: 'Method Not Allowed',
            message: 'This endpoint only accepts POST requests.'
        };
    }

    const client = createClient();

    try {
        await client.connect(); // Connect the client to the database

        // 1. Get parameters from the request body
        const body = await readBody(event);

        const {
            name,
            startDate,
            endDate,
            status,
            profileId
        } = body;

        // 2. Validate the received parameters (basic validations)
        if (!name || !startDate || !endDate || !status || !profileId) {
            setResponseStatus(event, 400); // Bad Request
            return {
                error: 'Bad Request',
                message: 'Missing required parameters: name, startDate, endDate, status, profileId.'
            };
        }

        // Validate UUID format for profileId
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(profileId)) {
            setResponseStatus(event, 400); // Bad Request
            return {
                error: 'Bad Request',
                message: 'Invalid profileId format. It must be a valid UUID.'
            };
        }

        // Validate date formats
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
            setResponseStatus(event, 400); // Bad Request
            return {
                error: 'Bad Request',
                message: 'Invalid startDate or endDate format.'
            };
        }

        // 3. Call the PostgreSQL function
        // Note: The function public.create_or_get_campaign returns campaign_id and status_message
        const query = `
            SELECT
                (public.create_or_get_campaign(
                    $1::VARCHAR,                  -- p_campaign_name
                    $2::TIMESTAMP WITH TIME ZONE, -- p_campaign_start_date
                    $3::TIMESTAMP WITH TIME ZONE, -- p_campaign_end_date
                    $4::VARCHAR,                  -- p_campaign_status
                    $5::UUID                      -- p_campaign_profile_id
                )).*
            AS campaign_data; 
        `;
        const values = [
            name,
            parsedStartDate.toISOString(),
            parsedEndDate.toISOString(),
            status,
            profileId
        ];

        const result = await client.query(query, values);

        // 4. Process the result and set the HTTP status code
        const campaignId = result.rows[0].campaign_id;
        const campaignStatus = result.rows[0].status_message; // 'created' or 'existing'

        if (campaignStatus === 'existing') {
            setResponseStatus(event, 409); // 409 Conflict: Resource already exists
            return {
                message: 'Campaign already exists.',
                campaignId: campaignId,
                status: campaignStatus
            };
        } else {
            setResponseStatus(event, 201); // 201 Created: Resource was successfully created
            return {
                message: 'Campaign created successfully.',
                campaignId: campaignId,
                status: campaignStatus
            };
        }

    } catch (error) {
        console.error('Error managing campaign:', error); // Log the full error for server-side debugging

        // Get error information from the dictionary or use the default fallback
        let errorInfo = postgresErrorDictionary[error.code] || postgresErrorDictionary.default;
        
        let statusCode = errorInfo.httpStatus;
        let errorMessage = errorInfo.message; // Detailed internal message
        let friendlyMessage = errorInfo.friendlyMessage; // Message for the client

        // Special handling for P0001 errors (RAISE EXCEPTION from PL/pgSQL)
        // These often carry specific messages that need further parsing
        if (error.code === 'P0001') {
            // Check for specific messages you might raise in your PL/pgSQL functions
            // Note: The specific messages below are examples, you'd tailor them to YOUR functions' RAISE EXCEPTION messages.
            if (error.message.includes('La campaña con ID') && error.message.includes('no existe')) { // From manage_lead_and_campaign_association, if campaign is missing
                statusCode = 404; // Not Found
                errorMessage = 'The specified campaign does not exist in the database.';
                friendlyMessage = 'The specified campaign was not found.';
            } else if (error.message.includes('Para crear un nuevo perfil') || error.message.includes('Missing or invalid profile data')) {
                statusCode = 400; // Bad Request
                errorMessage = 'Missing or invalid profile data required for new lead/profile creation.';
                friendlyMessage = 'Incomplete or invalid profile data for a new lead/profile.';
            } else {
                // If it's a P0001 but doesn't match a specific custom message,
                // use the original message from the database exception.
                errorMessage = error.message;
                friendlyMessage = error.message; // Use database message as friendly if no specific map
            }
        } else if (!error.code) {
             // This branch handles non-PostgreSQL errors (e.g., network issues, Nuxt internal errors)
             // or general JavaScript errors.
             statusCode = error.statusCode || 500;
             errorMessage = error.message || errorMessage;
             friendlyMessage = error.message || friendlyMessage;
        }

        setResponseStatus(event, statusCode);
        return {
            error: error.name || errorMessage, // Use JS Error name or the determined error message
            message: friendlyMessage,          // Friendly message for the client
            details: error.message             // Always include the original DB error message for debugging (e.g., error.detail, error.hint could also be useful if available)
        };
    } finally {
        if (client) {
            await client.end(); // Close the client connection
        }
    }
});