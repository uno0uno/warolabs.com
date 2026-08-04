// server/utils/blog/tenant.ts
// WARO Labs tenant UUID centralizado para el blog. Source: tabla public.tenants (slug='warolabs').

export const WAROLABS_TENANT_ID = 'b2fd8797-ec09-4ba5-aee4-f2d81ef66412' as const;

export const BLOG_PILLARS = [
  { value: 'pillar--software-a-medida', label: 'Software a Medida', description: 'Cuando conviene el desarrollo a medida y cuándo no' },
  { value: 'pillar--automatizacion-con-ia', label: 'Automatización con IA', description: 'Cómo reducir tareas repetitivas en tu empresa' },
  { value: 'pillar--ia-para-empresas', label: 'IA para Empresas', description: 'Casos de uso de IA más allá del chatbot' },
] as const;

export type BlogPillarValue = (typeof BLOG_PILLARS)[number]['value'];

export function isBlogPillar(value: string | null | undefined): value is BlogPillarValue {
  if (!value) return false;
  return BLOG_PILLARS.some((p) => p.value === value);
}

export function getBlogPillarLabel(value: string | null | undefined): string {
  if (!value) return 'Sin categoría';
  const found = BLOG_PILLARS.find((p) => p.value === value);
  return found ? found.label : value;
}
