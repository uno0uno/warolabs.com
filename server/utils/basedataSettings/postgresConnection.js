import pg from 'pg';
const { Client } = pg;


// Function to create a new Client instance with the connection configuration
export function createClient() {

    const { 
        dbUser, 
        dbHost, 
        dbName, 
        dbPassword, 
        dbPort 
    } = useRuntimeConfig();

    return new Client({
        user: dbUser,
        host: dbHost,
        database: dbName,
        password: dbPassword,
        port: dbPort
    });
}