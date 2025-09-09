import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Tabla de Perfiles (Actúa como la tabla principal de usuarios).
// El nombre real en la base de datos es "profile".
export const profiles = pgTable("profile", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  // Otros campos de tu tabla 'profile'
  name: text("name"),
  logoAvatar: text("logo_avatar"),
  description: text("description"),
  website: text("website"),
  status: text("status"),
  city: text("city"),
  banner: text("banner"),
  category: text("category"),
  shadowban: text("shadowban"),
  enterprise: text("enterprise"),
  userName: text("user_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  planet: text("planet"),
  country: text("country"),
  nationalityId: integer("nationality_id").notNull(),
  phoneNumber: text("phone_number").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  phoneCountryCode: integer("phone_country_code"),
});

// Relación: Un perfil tiene muchas sesiones, y puede ser miembro de muchos tenants
export const profileRelations = relations(profiles, ({ many }) => ({
  sessions: many(sessions),
  memberships: many(tenantMembers),
  magicTokens: many(magicTokens), // Nueva relación
}));

// 2. Tabla de Sesiones (Requerida por Better Auth).
// Se enlaza directamente a tu tabla 'profile'.
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  userId: uuid("user_id").notNull(),
});

// Relación: Una sesión pertenece a un perfil
export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(profiles, {
    fields: [sessions.userId],
    references: [profiles.id],
  }),
}));

// 3. Tabla de Magic Tokens
// Almacena los tokens únicos para la autenticación sin contraseña.
export const magicTokens = pgTable("magic_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

// Relación: Un token pertenece a un perfil
export const magicTokensRelations = relations(magicTokens, ({ one }) => ({
  user: one(profiles, {
    fields: [magicTokens.userId],
    references: [profiles.id],
  }),
}));

// 4. Tabla de Tenants (Organizaciones)
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relación: Un tenant tiene muchos miembros e invitaciones
export const tenantRelations = relations(tenants, ({ many }) => ({
  members: many(tenantMembers),
  invitations: many(tenantInvitations),
}));

// 5. Tabla de Miembros (tenant_members)
// Esta tabla asocia perfiles con tenants y les asigna un rol.
export const tenantMembers = pgTable("tenant_members", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  userId: uuid("user_id").notNull(), // Se enlaza con el ID de `profiles`
  role: text("role").notNull().default("member"),
});

// Relación: Un miembro pertenece a un perfil y a un tenant
export const memberRelations = relations(tenantMembers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantMembers.tenantId],
    references: [tenants.id],
  }),
  user: one(profiles, { // ¡Actualizado para referenciar a `profiles`!
    fields: [tenantMembers.userId],
    references: [profiles.id],
  }),
}));

// 6. Tabla de Invitaciones (tenant_invitations)
export const tenantInvitations = pgTable("tenant_invitations", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Relación: Una invitación pertenece a un tenant
export const invitationRelations = relations(tenantInvitations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantInvitations.tenantId],
    references: [tenants.id],
  }),
}));
