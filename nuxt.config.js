export default {
  ssr: false,
  target: 'static',
  head: {
    title: 'yukino-comment',
    htmlAttrs: {
      lang: 'ja'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '雪乃クリスタル専用コメントビューワー' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap'
      }
    ]
  },
  css: [
    '@/assets/css/main.css',
  ],
  plugins: [
  ],
  components: true,
  buildModules: [
  ],
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/dotenv',
  ],
  axios: {},
  server: {
    host: '0.0.0.0'
  },
  generate: {
    fallback: true
  },
  env: {
    API_URL: process.env.API_URL
  },
  build: {
  }
}
