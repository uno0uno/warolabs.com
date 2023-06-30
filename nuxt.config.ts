export default defineNuxtConfig({
  ssr: true,  
  buildModules: [
    '@nuxtjs/google-fonts'
  ],
  modules: [
    'nuxt-schema-org',
  ],
  head: {
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    ],
  },
  googleFonts: {
    families: {
      'Roboto+Slab': [100,200,300,400,500,600,700,800,900],
    },
  },
    // recommended
    runtimeConfig: {
      public: {
        siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
      }
    },
    // ...
    schemaOrg: {
      host: 'https://example.com',
    },
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
