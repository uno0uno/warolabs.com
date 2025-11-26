export default defineNuxtConfig({
  ssr: true,
  devServer: {
    port: 3000,
    host: 'localhost'
  },
  nitro: {
    preset: 'node-server'
  },
  runtimeConfig: {
    apiKey: process.env.NUXT_API_KEY,
    dbUser: process.env.NUXT_PRIVATE_DB_USER,
    dbHost: process.env.NUXT_PRIVATE_DB_HOST,
    dbName: process.env.NUXT_PRIVATE_DB_NAME,
    dbPassword: process.env.NUXT_PRIVATE_DB_PASSWORD,
    dbPort: process.env.NUXT_PRIVATE_DB_PORT ? Number(process.env.NUXT_PRIVATE_DB_PORT) : undefined,
    awsAccessKeyId: process.env.NUXT_PRIVATE_AWS_ACCES_KEY_ID,
    awsSecretAccessKey: process.env.NUXT_PRIVATE_AWS_SECRET_ACCESS_KEY,
    awsRegion: process.env.NUXT_PRIVATE_AWS_REGION,
    emailFrom: process.env.NUXT_PRIVATE_EMAIL_FROM,
    jwtSecret: process.env.NUXT_PRIVATE_JWT_SECRET,
    privateKeyEncrypter: process.env.NUXT_PRIVATE_PRIVATE_KEY_ENCRYPTER,
    tokenBackend: process.env.NUXT_PRIVATE_TOKEN_BACKEND,
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
      siteName: process.env.NUXT_PRIVATE_NAME_SITE,
      siteDescription: process.env.NUXT_PUBLIC_SITE_DESCRIPTION,
      nameSite: process.env.NUXT_PRIVATE_NAME_SITE,
      xNameUser: process.env.NUXT_PRIVATE_X_NAME,
      gtmContainerId: process.env.NUXT_PUBLIC_GTM_CONTAINER_ID,
      publicKeyEncrypter: process.env.NUXT_PUBLIC_PUBLIC_KEY_ENCRYPTER,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      canonicalUrl: process.env.NUXT_PUBLIC_CANONICAL_URL,
      heroTitle: process.env.NUXT_PUBLIC_HERO_TITLE,
      heroTitleHighlight: process.env.NUXT_PUBLIC_HERO_TITLE_HIGHLIGHT,
      heroDescription: process.env.NUXT_PUBLIC_HERO_DESCRIPTION,
      seoTitle: process.env.NUXT_PUBLIC_SEO_TITLE,
      seoDescription: process.env.NUXT_PUBLIC_SEO_DESCRIPTION,
      ogTitle: process.env.NUXT_PUBLIC_OG_TITLE,
      ogDescription: process.env.NUXT_PUBLIC_OG_DESCRIPTION,
      ogUrl: process.env.NUXT_PUBLIC_OG_URL,
      twitterTitle: process.env.NUXT_PUBLIC_TWITTER_TITLE,
      twitterDescription: process.env.NUXT_PUBLIC_TWITTER_DESCRIPTION
    }
  },
  app: {
    head: {
      titleTemplate: `%s | ${process.env.NUXT_PRIVATE_NAME_SITE}`,
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' },
        { name: 'description', content: process.env.NUXT_PUBLIC_SITE_DESCRIPTION },
        { name: 'author', content: process.env.NUXT_PUBLIC_SITE_AUTHOR },
        { name: 'robots', content: 'index, follow' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: process.env.NUXT_PRIVATE_NAME_SITE },
        { property: 'og:locale', content: process.env.NUXT_PUBLIC_SITE_LOCALE },
        { property: 'og:image', content: process.env.NUXT_PUBLIC_OG_IMAGE },
        { property: 'og:image:width', content: process.env.NUXT_PUBLIC_OG_IMAGE_WIDTH },
        { property: 'og:image:height', content: process.env.NUXT_PUBLIC_OG_IMAGE_HEIGHT },
        // Twitter Cards
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: process.env.NUXT_PRIVATE_X_NAME },
        { name: 'twitter:creator', content: process.env.NUXT_PRIVATE_X_NAME },
        { name: 'twitter:image', content: process.env.NUXT_PUBLIC_TWITTER_IMAGE }
      ],
      htmlAttrs: {
        lang: process.env.NUXT_PUBLIC_SITE_LANG
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: process.env.NUXT_PUBLIC_CANONICAL_URL }
      ],
      script: [
        // JSON-LD Schema.org Organization
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: process.env.NUXT_PRIVATE_NAME_SITE,
            url: process.env.NUXT_PUBLIC_SITE_URL,
            logo: process.env.NUXT_PUBLIC_LOGO_URL,
            description: process.env.NUXT_PUBLIC_SCHEMA_DESCRIPTION,
            sameAs: [
              process.env.NUXT_PUBLIC_GITHUB_URL,
              process.env.NUXT_PUBLIC_TWITTER_URL,
              process.env.NUXT_PUBLIC_TIKTOK_URL,
              process.env.NUXT_PUBLIC_LINKEDIN_URL
            ]
          })
        },
        // JSON-LD Schema.org WebSite
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: process.env.NUXT_PRIVATE_NAME_SITE,
            url: process.env.NUXT_PUBLIC_SITE_URL,
            description: process.env.NUXT_PUBLIC_SITE_DESCRIPTION,
            inLanguage: process.env.NUXT_PUBLIC_SITE_LANG,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${process.env.NUXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
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
