export default defineNuxtConfig({
  ssr: true,
  nitro: {
    preset: 'node-server'
  },
  runtimeConfig: {
    apiKey: process.env.NUXT_API_KEY || '',
    public: {
      baseUrl: process.env.NUXT_BASE_URL || 'https://warolabs.com'
    }
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'charset', content: 'utf-8' }
      ],
      htmlAttrs: {
        lang: 'es'
      }
    }
  },
  modules: [
    ['@nuxtjs/google-fonts', {
      families: {
        Lato: true
      }
    }],
    '@nuxtjs/sitemap',
    '@nuxtjs/robots'
  ],
  site: {
    url: 'https://warolabs.com'
  },
  sitemap: {
    siteUrl: 'https://warolabs.com', // Obligatorio según la documentación
    sources: ['/api/sitemap'], // Apunta al endpoint server/api/sitemap.ts
    xslTips: false, // Desactiva consejos XSL, como en tu configuración previa
    cacheMaxAgeSeconds: 600, // Caché de 10 minutos
    debug: false // Desactiva logs de depuración en producción
  },
  robots: {
    credits: false,
    groups: [
      {
        userAgents: ['GPTBot'],
        disallow: ['/api/*'],
        allow: ['/']
      }
    ]
  },
  head: {
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  devtools: { enabled: true },
  css: ['~/assets/css/main.scss'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  }
});