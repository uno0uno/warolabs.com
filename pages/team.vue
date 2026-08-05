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
      <div class="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
        <p v-if="pending" class="col-span-full text-center text-secondary">Cargando equipo…</p>
        <p v-else-if="error" class="col-span-full text-center text-red-500">No pudimos cargar el equipo.</p>
        <p v-else-if="!teamMembers || teamMembers.length === 0" class="col-span-full text-center text-secondary">Aún no hay miembros del equipo.</p>
        <TeamMemberCard
          v-for="(member, index) in teamMembers"
          v-else
          :key="member.id"
          :member="{
            name: member.name,
            role: member.role,
            bio: member.description,
            image: member.avatar || '',
            social: member.social,
          }"
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
interface TeamMember {
  id: string
  name: string
  userName: string | null
  avatar: string | null
  role: string
  description: string
  social: {
    github?: string
    twitter?: string
    linkedin?: string
  }
}

const { data: teamMembers, pending, error } = await useFetch<TeamMember[]>('/api/team', {
  key: 'team-members',
})

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
      innerHTML: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Waro Labs',
        url: 'https://warolabs.com',
        description: 'Laboratorio de innovación tecnológica',
        member: (teamMembers.value ?? []).map((member) => ({
          '@type': 'Person',
          name: member.name,
          jobTitle: member.role,
          description: member.description
        }))
      }))
    }
  ]
})
</script>
