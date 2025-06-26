// server\api\marketing\createLeadCampain.js

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
            campaignId,
            leadEmail,
            leadSource,
            profileName,
            profilePhoneNumber,
            profileNationalityId
        } = body;

        // 2. Validate the received parameters (basic validations)
        // campaignId and leadEmail are always required
        if (!campaignId || !leadEmail) {
            setResponseStatus(event, 400); // Bad Request
            return {
                error: 'Bad Request',
                message: 'Missing required parameters: campaignId, leadEmail.'
            };
        }

        // Validate UUID format for campaignId
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(campaignId)) {
            setResponseStatus(event, 400); // Bad Request
            return {
                error: 'Bad Request',
                message: 'Invalid campaignId format. It must be a valid UUID.'
            };
        }

        // Basic email validation
        if (!leadEmail.includes('@') || !leadEmail.includes('.')) {
            setResponseStatus(event, 400); // Bad Request
            return {
                error: 'Bad Request',
                message: 'Invalid leadEmail format.'
            };
        }

        // Conditional validation for profile creation parameters (if they are explicitly null)
        if (
            (profileName !== undefined && profileName === null) ||
            (profilePhoneNumber !== undefined && profilePhoneNumber === null) ||
            (profileNationalityId !== undefined && profileNationalityId === null)
        ) {
            setResponseStatus(event, 400); // Bad Request
            return {
                error: 'Bad Request',
                message: 'Profile creation parameters (profileName, profilePhoneNumber, profileNationalityId) cannot be explicitly null if provided.'
            };
        }
        
        // Validate profileNationalityId type
        if (profileNationalityId !== undefined && profileNationalityId !== null && typeof profileNationalityId !== 'number') {
            setResponseStatus(event, 400); // Bad Request
            return {
                error: 'Bad Request',
                message: 'profileNationalityId must be an integer.'
            };
        }

        // 3. Call the PostgreSQL function
        // The function public.manage_lead_and_campaign_association returns:
        // lead_return_id UUID, profile_return_id UUID, association_status TEXT
        const query = `
            SELECT
                t.lead_return_id,
                t.profile_return_id,
                t.association_status
            FROM public.manage_lead_and_campaign_association(
                $1::UUID,                         -- p_campaign_id
                $2::VARCHAR,                      -- p_lead_email
                $3::VARCHAR,                      -- p_lead_source
                $4::VARCHAR,                      -- p_profile_name
                $5::VARCHAR,                      -- p_profile_phone_number
                $6::INTEGER                       -- p_profile_nationality_id
            ) AS t; -- Give an alias to the table returned by the function
        `;
        const values = [
            campaignId,
            leadEmail,
            leadSource || null, // Pass null if leadSource is undefined/empty
            profileName || null, // Pass null if profileName is undefined/empty
            profilePhoneNumber || null, // Pass null if profilePhoneNumber is undefined/empty
            profileNationalityId || null // Pass null if profileNationalityId is undefined/empty
        ];

        const result = await client.query(query, values);

        // 4. Process the result and set the HTTP status code based on function's association_status
        const leadId = result.rows[0].lead_return_id;
        const associatedProfileId = result.rows[0].profile_return_id;
        const associationStatus = result.rows[0].association_status; // e.g., 'profile_created_lead_created_association_created'

        // Determine HTTP status based on the returned associationStatus
        if (associationStatus.includes('_association_created')) {
            setResponseStatus(event, 201); // 201 Created: New association was made
            return {
                message: 'Lead successfully associated with campaign.',
                leadId: leadId,
                profileId: associatedProfileId,
                status: associationStatus
            };
        } else if (associationStatus.includes('_association_existing')) {
            setResponseStatus(event, 409); // 409 Conflict: Association already existed
            return {
                message: 'Lead already associated with this campaign.',
                leadId: leadId,
                profileId: associatedProfileId,
                status: associationStatus
            };
        } else {
            // This case should ideally not be reached if statuses are always one of the above.
            // It's a fallback for unexpected status values.
            setResponseStatus(event, 500); // Internal Server Error
            return {
                error: 'Unexpected Status',
                message: 'An unexpected status was returned by the database function.',
                details: associationStatus
            };
        }

    } catch (error) {
        console.error('Error managing lead and campaign association:', error); // Log full error for server-side debugging

        // Get error information from the dictionary or use the default fallback
        let errorInfo = postgresErrorDictionary[error.code] || postgresErrorDictionary.default;
        
        let statusCode = errorInfo.httpStatus;
        let errorMessage = errorInfo.message; // Detailed internal message
        let friendlyMessage = errorInfo.friendlyMessage; // Message for the client

        // Special handling for P0001 errors (RAISE EXCEPTION from PL/pgSQL)
        if (error.code === 'P0001') {
            if (error.message.includes('La campaña con ID') && error.message.includes('no existe')) {
                statusCode = 404; // Not Found
                errorMessage = 'The specified campaign does not exist in the database.';
                friendlyMessage = 'The specified campaign was not found.';
            } else if (error.message.includes('Para crear un nuevo perfil') || error.message.includes('Missing or invalid profile data')) {
                statusCode = 400; // Bad Request
                errorMessage = 'Missing or invalid profile data required for new lead/profile creation.';
                friendlyMessage = 'Incomplete or invalid profile data for a new lead/profile.';
            } else {
                // For other custom P0001 exceptions, use the database message directly
                errorMessage = error.message;
                friendlyMessage = error.message; 
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
            error: error.name || errorMessage,
            message: friendlyMessage,
            details: error.message
        };
    } finally {
        if (client) {
            await client.end(); // Close the client connection
        }
    }
});