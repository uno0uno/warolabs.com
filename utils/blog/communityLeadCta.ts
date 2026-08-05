export type CommunityCtaPlacement = 'benefit' | 'final';

export interface CommunityCtaContent {
  headline: string;
  body: string;
  button: string;
  microcopy: string;
}

const COMMUNITY_MICROCOPY = 'Gratis. Sin spam. Solo contenido que me hubiera gustado leer cuando empecé.';

function communityCopyEs(): Pick<CommunityCtaContent, 'headline' | 'body' | 'button'> {
  return {
    headline: 'Te ayudo a crecer desde mi experiencia.',
    body: 'Comparto lo que aprendo sobre software, IA y construir en público. Únete gratis, solo te pido tu correo.',
    button: 'Quiero entrar a la comunidad',
  };
}

const PLACEMENT_VARIANT: Record<CommunityCtaPlacement, { headline: string; body: string }> = {
  benefit: {
    headline: 'Lo que me habría gustado leer cuando empecé.',
    body: 'Estoy escribiendo en abierto sobre lo que voy aprendiendo al construir software, IA y comunidad. Si te suma, te lo envío por correo cuando publique algo nuevo.',
  },
  final: {
    headline: 'Te ayudo a crecer desde mi experiencia.',
    body: 'Comparto lo que aprendo sobre software, IA y construir en público. Únete gratis, solo te pido tu correo.',
  },
};

export function getCommunityCta(placement: CommunityCtaPlacement = 'final'): CommunityCtaContent {
  const variant = PLACEMENT_VARIANT[placement] || PLACEMENT_VARIANT.final;
  return {
    headline: variant.headline,
    body: variant.body,
    button: communityCopyEs().button,
    microcopy: COMMUNITY_MICROCOPY,
  };
}

export function blogLeadSource(slug: string): string {
  return `blog:community:${slug}`;
}
