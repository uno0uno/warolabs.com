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
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'https://warolabs.com',
      siteName: 'Waro Labs',
      siteDescription: 'Diseño + IA + Marketing. Súmate al lab open-source donde destripamos las herramientas del futuro para que LatAm la rompa.',
      nameSite: process.env.NUXT_PRIVATE_NAME_SITE || '',
      xNameUser: process.env.NUXT_PRIVATE_X_NAME || '',
      gtmContainerId: process.env.NUXT_PUBLIC_GTM_CONTAINER_ID || '',
      publicKeyEncrypter: process.env.NUXT_PUBLIC_PUBLIC_KEY_ENCRYPTER || '',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://warolabs.com',
      canonicalUrl: process.env.NUXT_PUBLIC_CANONICAL_URL || 'https://warolabs.com',
      seoTitle: process.env.NUXT_PUBLIC_SEO_TITLE || '',
      seoDescription: process.env.NUXT_PUBLIC_SEO_DESCRIPTION || '',
      ogTitle: process.env.NUXT_PUBLIC_OG_TITLE || '',
      ogDescription: process.env.NUXT_PUBLIC_OG_DESCRIPTION || '',
      ogUrl: process.env.NUXT_PUBLIC_OG_URL || 'https://warolabs.com',
      twitterTitle: process.env.NUXT_PUBLIC_TWITTER_TITLE || '',
      twitterDescription: process.env.NUXT_PUBLIC_TWITTER_DESCRIPTION || ''
    }
  },
  app: {
    head: {
      titleTemplate: '%s | Waro Labs',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' },
        { name: 'description', content: 'Diseño + IA + Marketing. Súmate al lab open-source donde destripamos las herramientas del futuro para que LatAm la rompa.' },
        { name: 'author', content: 'Waro Labs' },
        { name: 'robots', content: 'index, follow' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Waro Labs' },
        { property: 'og:locale', content: 'es_ES' },
        { property: 'og:image', content: 'https://warolabs.com/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        // Twitter Cards
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@warolabs' },
        { name: 'twitter:creator', content: '@warolabs' },
        { name: 'twitter:image', content: 'https://warolabs.com/og-image.png' }
      ],
      htmlAttrs: {
        lang: 'es'
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: process.env.NUXT_PUBLIC_CANONICAL_URL || process.env.NUXT_PUBLIC_SITE_URL }
      ],
      script: [
        // JSON-LD Schema.org Organization
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
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
          })
        },
        // JSON-LD Schema.org WebSite
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Waro Labs',
            url: 'https://warolabs.com',
            description: 'Diseño + IA + Marketing. Súmate al lab open-source donde destripamos las herramientas del futuro para que LatAm la rompa.',
            inLanguage: 'es',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://warolabs.com/search?q={search_term_string}',
              'query-input': 'required name=search_term_string'
            }
          })
        }
      ]
    }
  },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/robots'
  ],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
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

  devtools: { enabled: true },
  css: ['~/assets/css/main.scss', '~/assets/css/components.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  }
})
