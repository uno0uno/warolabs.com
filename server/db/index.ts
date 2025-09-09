// server/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

  const { 
        dbUser, 
        dbHost, 
        dbName, 
        dbPassword, 
        dbPort 
    } = useRuntimeConfig();

const client = postgres({
  host: dbHost!,
  user: dbUser!,
  password: dbPassword!,
  database: dbName!,
  port: dbPort!
});

export const db = drizzle(client, { schema });