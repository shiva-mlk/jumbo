import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxtjs/i18n', '@nuxt/icon', '@nuxtjs/leaflet'],
  i18n: {
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', language: 'en-GB', name: 'English', file: 'en.json' },
      { code: 'nl', language: 'nl-NL', name: 'Nederlands', file: 'nl.json' }
    ],
    detectBrowserLanguage: false
  },
  icon: {
    mode: 'svg',
    serverBundle: { collections: ['lucide'] }
  },
  components: [
    { path: '@/components', pathPrefix: false }
  ],
  css: ['@/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()]
  },
  typescript: { strict: true }
})
