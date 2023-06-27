export default defineNuxtConfig({
  modules: [
    'nuxt-schema-org',
  ],
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
