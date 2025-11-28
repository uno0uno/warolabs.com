<template>
  <section class="relative min-h-screen flex flex-col bg-body bg-dots text-main overflow-hidden">
    <!-- Ambient Glow -->
    <div class="absolute w-[400px] h-[300px] md:w-[800px] md:h-[600px] top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[60px] md:blur-[80px] -z-10 pointer-events-none glow transition-all duration-300"></div>

    <!-- Content Container -->
    <div class="flex-grow flex flex-col items-center justify-start pt-20 pb-16 px-4">
      <!-- Hero Section -->
      <div class="text-center mb-16 max-w-3xl animate-fade-in-up" style="animation-delay: 0.1s">
        <h1 class="font-display font-normal text-4xl sm:text-5xl md:text-6xl leading-[1.15] tracking-tight mb-6 text-hero-gradient">
          Nuestro <span class="font-sans font-black text-accent-lime text-gradient-reset">Equipo</span>
        </h1>
        <p class="text-lg md:text-xl text-secondary leading-relaxed">
          Una red de colaboradores que aporta voluntariamente al crecimiento del ecosistema open-source de software y marketing desde LatAm para el mundo.
        </p>
      </div>

      <!-- Team Grid -->
      <div class="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <TeamMemberCard 
          v-for="(member, index) in teamMembers" 
          :key="member.name"
          :member="member"
          class="animate-fade-in-up"
          :style="{ animationDelay: `${0.2 + (index * 0.1)}s` }"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<script setup lang="ts">
// Mock Team Data - defined first to avoid hoisting issues
const teamMembers = [
  {
    name: 'Carlos Rodríguez',
    role: 'CEO & Fundador',
    bio: 'Visionario tecnológico con más de 10 años de experiencia en desarrollo de software y liderazgo de equipos innovadores.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
    social: {
      github: 'https://github.com',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com'
    }
  },
  {
    name: 'María González',
    role: 'CTO',
    bio: 'Experta en arquitectura de software y sistemas distribuidos. Apasionada por crear soluciones escalables y eficientes.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces',
    social: {
      github: 'https://github.com',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com'
    }
  },
  {
    name: 'Juan Martínez',
    role: 'Lead Developer',
    bio: 'Desarrollador full-stack con experiencia en tecnologías modernas. Enfocado en crear experiencias de usuario excepcionales.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    }
  },
  {
    name: 'Ana Silva',
    role: 'UX/UI Designer',
    bio: 'Diseñadora creativa especializada en interfaces intuitivas y experiencias de usuario memorables.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces',
    social: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com'
    }
  },
  {
    name: 'Pedro Ramírez',
    role: 'DevOps Engineer',
    bio: 'Especialista en infraestructura cloud y automatización. Garantiza que nuestros sistemas funcionen sin problemas 24/7.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
    social: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    }
  },
  {
    name: 'Laura Torres',
    role: 'Product Manager',
    bio: 'Gestora de producto con visión estratégica. Conecta las necesidades del usuario con soluciones tecnológicas innovadoras.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=faces',
    social: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com'
    }
  }
]

// SEO Configuration
useSeoMeta({
  title: 'Equipo - Waro Labs',
  description: 'Conoce al equipo detrás de Waro Labs. Desarrolladores, diseñadores y visionarios trabajando juntos para crear soluciones innovadoras.',
  ogTitle: 'Equipo - Waro Labs',
  ogDescription: 'Conoce al equipo detrás de Waro Labs. Desarrolladores, diseñadores y visionarios trabajando juntos para crear soluciones innovadoras.',
  ogUrl: 'https://warolabs.com/team',
  twitterTitle: 'Equipo - Waro Labs',
  twitterDescription: 'Conoce al equipo detrás de Waro Labs. Desarrolladores, diseñadores y visionarios trabajando juntos para crear soluciones innovadoras.'
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Waro Labs',
        url: 'https://warolabs.com',
        description: 'Laboratorio de innovación tecnológica',
        member: teamMembers.map(member => ({
          '@type': 'Person',
          name: member.name,
          jobTitle: member.role,
          description: member.bio
        }))
      })
    }
  ]
})
</script>
