import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon-64.png'],
      manifest: {
        id: '/',
        name: '제대로 | 전역 후 자산관리',
        short_name: '제대로',
        description: '전역 이후의 자산 목표를 제대로 준비하는 AI 금융 서비스',
        lang: 'ko',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        // 앱 배경(--ui-background: --gray-50)과 맞춰야 실행 화면이 튀지 않는다
        background_color: '#fafafa',
        theme_color: '#fafafa',
        icons: [
          { src: 'icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        /*
          앱 셸(JS/CSS/HTML, 약 1.2MB)만 프리캐시한다.
          이미지와 폰트를 합치면 17MB가 넘어서, 전부 프리캐시하면
          설치 시점에 모바일 데이터로 그걸 다 받게 된다.
          미디어는 아래 runtimeCaching으로 쓰는 만큼만 받는다.
        */
        globPatterns: ['**/*.{js,css,html}'],
        cleanupOutdatedCaches: true,
        // SPA 딥링크 대응. /api는 백엔드로 가야 하므로 반드시 제외한다.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            /*
              금융 데이터는 절대 캐시하지 않는다. 기본 동작도 통과이지만,
              나중에 누가 광범위한 캐시 규칙을 추가해도 여기서 막히도록
              명시적으로 선언해 둔다.
            */
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'jaedaero-fonts',
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'jaedaero-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        // 기본 dev 서버에서는 끈다. 확인하려면 npm run build && npm run preview
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://jaedaerobackend-production.up.railway.app/',
        changeOrigin: true,
      },
    },
  },
}))
