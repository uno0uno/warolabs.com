// server\utils\basedataSettings\postgresErrorMap.js

export const postgresErrorDictionary = {
    // Common error classes and their SQLSTATE codes
    // You can find the full list in the PostgreSQL documentation:
    // https://www.postgresql.org/docs/current/errcodes-table.html

    // Class 22 - Data Exception
    '22001': { // string_data_right_truncation
        httpStatus: 400,
        message: 'Data too long for column (e.g., trying to insert a string larger than VARCHAR limit).',
        friendlyMessage: 'One of the text fields is too long.'
    },
    '22P02': { // invalid_text_representation
        httpStatus: 400,
        message: 'Invalid input syntax for type (e.g., malformed UUID, text for a number field, bad date format).',
        friendlyMessage: 'Incorrect data format for one of the fields (e.g., invalid UUID, date, number).'
    },
    '22003': { // numeric_value_out_of_range
        httpStatus: 400,
        message: 'Numeric value out of range (e.g., value too large for an INTEGER type).',
        friendlyMessage: 'Numeric value out of range.'
    },
    '22007': { // invalid_datetime_format
        httpStatus: 400,
        message: 'Invalid datetime format.',
        friendlyMessage: 'Invalid date or time format.'
    },
    '22012': { // division_by_zero
        httpStatus: 400,
        message: 'Division by zero error.',
        friendlyMessage: 'Attempt to divide by zero.'
    },

    // Class 23 - Integrity Constraint Violation
    '23502': { // not_null_violation
        httpStatus: 400,
        message: 'A required field is missing or null.',
        friendlyMessage: 'A required field is missing.'
    },
    '23503': { // foreign_key_violation
        httpStatus: 404, // Or 400, depending on context. 404 is common if the referenced resource doesn't exist.
        message: 'Referenced resource does not exist (e.g., profileId or campaignId not found).',
        friendlyMessage: 'The referenced resource (e.g., profile, campaign) does not exist.'
    },
    '23505': { // unique_violation
        httpStatus: 409, // Conflict
        message: 'A resource with this unique identifier already exists.',
        friendlyMessage: 'A resource with this unique identifier already exists.'
    },
    '23514': { // check_violation
        httpStatus: 400,
        message: 'A check constraint was violated (data does not meet specified criteria).',
        friendlyMessage: 'The provided data does not meet the defined rules (CHECK constraint).'
    },

    // Class P00 - PL/pgSQL Error (Errors thrown by PL/pgSQL functions)
    'P0001': { // raise_exception (SQLSTATE for RAISE EXCEPTION without specific ERRCODE)
        httpStatus: 400,
        message: 'Custom error from database function.',
        friendlyMessage: 'Specific database operation error.'
    },

    // Class 42 - Syntax Error / Schema Definition
    '42P01': { // undefined_table
        httpStatus: 500,
        message: 'Referenced table does not exist in the database.',
        friendlyMessage: 'Internal error: Database table not found.'
    },
    '42P02': { // undefined_column
        httpStatus: 500,
        message: 'Referenced column does not exist in the table.',
        friendlyMessage: 'Internal error: Database column not found.'
    },
    '42883': { // undefined_function
        httpStatus: 500,
        message: 'The database function (or its specific signature) does not exist.',
        friendlyMessage: 'Internal error: Database function or its parameters do not match.'
    },

    // Default Fallback
    'default': {
        httpStatus: 500,
        message: 'An unknown database error occurred.',
        friendlyMessage: 'An unexpected database error occurred.'
    }
};