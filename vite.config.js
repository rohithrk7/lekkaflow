import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'BillSwift Retail Billing',
        short_name: 'BillSwift',
        description: 'GST-ready retail billing for India',
        theme_color: '#10B981',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3067/3067167.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3067/3067167.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
