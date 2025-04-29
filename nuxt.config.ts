export default defineNuxtConfig({
  ssr: true, // Habilita SSR
  target: 'server', // Configura el target como 'server' para SSR
  nitro: {
    preset: 'aws_amplify'
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'charset', content: 'utf-8' }
      ],
      htmlAttrs: {
        lang: 'es',
      },
    },
  },
  modules: [
    ['@nuxtjs/google-fonts', {
      families: {
        Lato: true
      }
    }], 'nuxt-simple-sitemap', 'nuxt-simple-robots'],
  site: {
    url: 'https://warolabs.com/',
  },
  sitemap: {
    xslTips: false,
  },
  robots: {
    credits: false,
    groups: [
      {
        userAgents: ['GPTBot'],
        disallow: ['/api/*'],
        allow: ['/'],
      },
    ]
  },
  head: {
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  devtools: { enabled: true },
  css: ['~/assets/css/main.scss'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  }
});
