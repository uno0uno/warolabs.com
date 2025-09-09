// api/src/lib/auth.ts
import { Auth } from '@auth/core';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '../db/index';
import { profiles, sessions } from '../db/schema'; // <-- La ruta de importación de Drizzle está aquí.
import { eq } from 'drizzle-orm';

const adapter = DrizzleAdapter(db, {
  usersTable: profiles,
  sessionsTable: sessions,
});

export const auth = new Auth({
  adapter,
  secret: process.env.AUTH_SECRET!,
});