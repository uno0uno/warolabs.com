export default defineNuxtConfig({
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    }
  },
  buildModules: [
    '@nuxtjs/google-fonts'
  ],
  modules: [],
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
  devtools: { enabled: true },
  css: ['~/assets/css/main.scss'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
