// server/api/team.get.ts
// GET /api/team -> 200 [{ id, name, userName, avatar, role, description, social }]
// Miembros activos del tenant WAROLABS_TENANT_ID, JOIN profile.
// Mapea tenant_members.role a un role display legible para /team.

import { defineEventHandler } from 'h3';
import { withPostgresClient } from '../utils/basedataSettings/withPostgresClient';
import { WAROLABS_TENANT_ID } from '../utils/blog/tenant';

interface TeamRow {
  id: string;
  name: string;
  user_name: string | null;
  logo_avatar: string | null;
  description: string | null;
  role: string | null;
}

interface TeamMember {
  id: string;
  name: string;
  userName: string | null;
  avatar: string | null;
  role: string;
  description: string;
  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
}

const ROLE_DISPLAY: Record<string, string> = {
  superuser: 'CEO & Fundador',
  admin: 'CTO',
  customer: 'Team Member',
};

function toDisplayRole(tenantRole: string | null | undefined): string {
  if (!tenantRole) return ROLE_DISPLAY.customer;
  return ROLE_DISPLAY[tenantRole] || ROLE_DISPLAY.customer;
}

function buildInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function buildAvatarFallback(name: string): string {
  const initials = buildInitials(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#dadf5b"/><text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-family="system-ui, sans-serif" font-size="180" font-weight="700" fill="#2d2d2e">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default defineEventHandler(async (event) => {
  const rows = await withPostgresClient(async (client) => {
    const result = await client.query<TeamRow>(
      `SELECT p.id, p.name, p.user_name, p.logo_avatar, p.description, tm.role
       FROM public.tenant_members tm
       JOIN public.profile p ON p.id = tm.user_id
       WHERE tm.tenant_id = $1
         AND tm.is_active = true
         AND tm.terminated_at IS NULL
       ORDER BY tm.role ASC, p.name ASC`,
      [WAROLABS_TENANT_ID]
    );
    return result.rows;
  }, event);

  const members: TeamMember[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    userName: r.user_name,
    avatar: r.logo_avatar || buildAvatarFallback(r.name),
    role: toDisplayRole(r.role),
    description: r.description || '',
    social: {},
  }));

  return members;
});
