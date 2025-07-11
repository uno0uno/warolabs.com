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
    awsAccessKeyId: process.env.NUXT_PRIVATE_AWS_ACCES_KEY_ID || '',
    awsSecretAccessKey: process.env.NUXT_PRIVATE_AWS_SECRET_ACCESS_KEY|| '',
    awsRegion: process.env.NUXT_PRIVATE_AWS_REGION || 'us-east-1',
    emailFrom: process.env.NUXT_PRIVATE_EMAIL_FROM || '',
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
      nameSite: process.env.NUXT_PRIVATE_NAME_SITE || '',
      xNameUser: process.env.NUXT_PRIVATE_X_NAME || '',
      gtmContainerId: process.env.NUXT_PUBLIC_GTM_CONTAINER_ID || ''
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