export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'charset', content: 'utf-8' },
        { name: 'lang', content: 'es-CO' },
        { name: 'canonical', content: 'https://www.warocol.com/' },
      ],
    },
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
