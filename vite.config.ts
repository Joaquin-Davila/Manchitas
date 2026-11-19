import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo-manchitas.png', 'logo-manchitas-sin-titulo.png'],
      workbox: {
        // Pre-caché: estructura de la app, chunks, íconos e imágenes de public/img. De las fuentes
        // solo las latinas (el español no usa devanagari, cirílico, griego ni vietnamita).
        globPatterns: ['**/*.{js,css,html,svg,png,webp}', '**/*-latin-*.woff2', '**/*-latin-ext-*.woff2'],
        navigateFallback: '/index.html',
        // Nunca devolver el HTML a peticiones de datos.
        navigateFallbackDenylist: [/^\/(rest|auth|storage|functions)\//],
        cleanupOutdatedCaches: true,
        // Solo se cachea en tiempo de ejecución lo que está en esta lista: mosaicos del mapa y fotos
        // públicas de mascotas. Auth, REST, cartillas, evidencia, URLs firmadas (/object/sign/) y
        // la función enviar-reporte van siempre directo a la red.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mosaicos-osm',
              expiration: { maxEntries: 150, maxAgeSeconds: 30 * 24 * 60 * 60 },
              // Leaflet los pide como <img> sin CORS: la respuesta es opaca (estado 0).
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/storage\/v1\/object\/public\/mascotas-fotos\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'fotos-mascotas',
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'Manchitas',
        short_name: 'Manchitas',
        description:
          'Identifica a tu perro, conecta con tu comunidad y protege a las mascotas de Hermosillo.',
        lang: 'es-MX',
        theme_color: '#FFFDF8',
        background_color: '#F7F3EA',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
