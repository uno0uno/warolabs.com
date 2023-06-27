export default defineNuxtConfig({
  modules: [
    'nuxt-schema-org',
  ],
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://warocol.com',
    }
  },
  schemaOrg: {
    host: 'https://warocol.com',
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
