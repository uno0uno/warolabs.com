export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      gtmContainerId: '',
      supabaseUrl: '',
      supabaseAnonKey: '',
      siteUrl: ''
    },
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
  buildModules: ['@nuxtjs/google-fonts'],
  modules: ['nuxt-simple-sitemap', 'nuxt-simple-robots'],
  site: {
    url: 'https://warocol.com/',
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
  googleFonts: {
    families: {
      Lato: true
    }
  },
  devtools: { enabled: true },
  css: ['~/assets/css/main.scss'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
});
