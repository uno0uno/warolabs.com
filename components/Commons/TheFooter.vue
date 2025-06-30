<script setup>

const pageAndOrganizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "name": "Waro Labs - Comunidad y Cursos de Inteligencia Artificial",
      "description": "Waro Labs es la comunidad donde la Inteligencia Artificial se vuelve comprensible y accesible para todos. Descubre nuestros eventos, labs y cursos para integrar la IA en tu vida y proyectos.", // Descripción concisa de esta página específica
      "url": "https://www.warolabs.com/",
      "isPartOf": {
        "@type": "WebSite",
        "url": "https://www.warolabs.com/",
        "name": "Waro Labs"
      }
    },
    {
      "@type": "Organization",
      "name": "Waro Labs",
      "url": "https://www.warolabs.com/",
      "logo": "https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/landing/waro_labs_logo.png",
      "description": "Comunidad y empresa tecnológica que hace la inteligencia artificial (IA) comprensible y accesible para todos a través de eventos, labs y formación práctica. Ideal para principiantes que buscan entender, conectar y aplicar la IA en su día a día.", // Descripción completa de tu organización
      "email": "contacto@warolabs.com",
      "telephone": "+573001234567",
      "sameAs": [
        "https://www.facebook.com/WaroLabs",
        "https://twitter.com/WaroLabs",
        "https://www.linkedin.com/company/WaroLabs",
        "https://www.instagram.com/WaroLabs",
        "https://www.tiktok.com/@WaroLabs"
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Carrera 7 # 120-20",
        "addressLocality": "Bogotá",
        "addressRegion": "Bogotá D.C.",
        "postalCode": "110111",
        "addressCountry": "CO"
      }
    }
  ]
};

useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(pageAndOrganizationSchema)
    }
  ]
});

</script>

<template>
    <div class="flex flex-col gap-4 items-center justify-center p-4 bg-black text-white">
        <div class="flex flex-col gap-2 items-center justify-center">
            <p class="text-sm font-light leading-relaxed text-stone-400 mb-2">© 2025 Waro Labs. Todos los derechos reservados.</p>
            <p class="text-sm font-light leading-relaxed text-stone-400 mb-2">Política de privacidad | Términos de servicio</p>
        </div>
        <div class="flex gap-4">
            <a href="https://www.facebook.com/WaroLabs" class="text-white hover:text-gray-400" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://twitter.com/WaroLabs" class="text-white hover:text-gray-400" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://www.linkedin.com/company/WaroLabs" class="text-white hover:text-gray-400" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://www.instagram.com/WaroLabs" class="text-white hover:text-gray-400" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.tiktok.com/@WaroLabs" class="text-white hover:text-gray-400" target="_blank" rel="noopener noreferrer">TikTok</a>
        </div>
    </div>
</template>