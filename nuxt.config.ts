export default defineNuxtConfig({
  ssr: true,
  nitro: {
    preset: 'node-server'
  },
  runtimeConfig: {
    apiKey: process.env.NUXT_API_KEY || '',
    dbUser: process.env.NUXT_PRIVATE_DB_USER || '',
    dbHost: process.env.NUXT_PRIVATE_DB_HOST || '',
    dbName: process.env.NUXT_PRIVATE_DB_NAME || '',
    dbPassword: process.env.NUXT_PRIVATE_DB_PASSWORD || '',
    dbPort: process.env.NUXT_PRIVATE_DB_PORT ? Number(process.env.NUXT_PRIVATE_DB_PORT) : 5432,
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
    '@nuxtjs/robots'
  ],
  site: {
    url: 'https://warolabs.com'
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
})