export default defineNuxtConfig({
  ssr: true,
  devServer: {
    port: 4000,
    host: 'localhost'
  },
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
    awsSecretAccessKey: process.env.NUXT_PRIVATE_AWS_SECRET_ACCESS_KEY || '',
    awsRegion: process.env.NUXT_PRIVATE_AWS_REGION || '',
    emailFrom: process.env.NUXT_PRIVATE_EMAIL_FROM || '',
    jwtSecret: process.env.NUXT_PRIVATE_JWT_SECRET || '',
    privateKeyEncrypter: process.env.NUXT_PRIVATE_PRIVATE_KEY_ENCRYPTER || '',
    tokenBackend: process.env.NUXT_PRIVATE_TOKEN_BACKEND || '',
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || '',
      nameSite: process.env.NUXT_PRIVATE_NAME_SITE || '',
      xNameUser: process.env.NUXT_PRIVATE_X_NAME || '',
      gtmContainerId: process.env.NUXT_PUBLIC_GTM_CONTAINER_ID || '',
      publicKeyEncrypter: process.env.NUXT_PUBLIC_PUBLIC_KEY_ENCRYPTER || ''
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
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/seo'
  ],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },

  // ============================================
  // SEO CONFIGURATION
  // ============================================
  site: {
    url: 'https://warolabs.com',
    name: 'Waro Labs',
    description: 'Diseño + IA + Marketing. Súmate al lab open-source donde destripamos las herramientas del futuro para que LatAm la rompa.',
    defaultLocale: 'es'
  },

  // Sitemap automático
  sitemap: {
    excludeAppSources: ['nuxt:pages'],
    sources: ['/api/__sitemap__/urls']
  },

  // Robots.txt mejorado
  robots: {
    credits: false,
    groups: [
      {
        userAgents: ['*'],
        allow: ['/'],
        disallow: ['/api/*', '/admin/*', '/_nuxt/*']
      },
      {
        userAgents: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai'],
        disallow: ['/']
      }
    ]
  },

  // Open Graph defaults
  ogImage: {
    enabled: true,
    defaults: {
      width: 1200,
      height: 630,
      type: 'image/png'
    }
  },

  // Schema.org JSON-LD
  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Waro Labs',
      url: 'https://warolabs.com',
      logo: 'https://warolabs.com/logo.png',
      description: 'Hacemos software de verdad, exprimiendo las IAs más top del mundo. Lab open-source de Diseño + IA + Marketing para que LatAm la rompa.',
      sameAs: [
        'https://github.com/warolabs',
        'https://twitter.com/warolabs',
        'https://www.tiktok.com/@waro.labs',
        'https://www.linkedin.com/company/warolabs'
      ]
    }
  },

  // Link Checker (solo en desarrollo)
  linkChecker: {
    enabled: false
  },

  // SEO Experiments
  seoExperiments: {
    enabled: false
  },

  devtools: { enabled: true },
  css: ['~/assets/css/main.scss', '~/assets/css/components.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  }
})