import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const clientRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, clientRoot, 'VITE_')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://127.0.0.1:4001'

  return {
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          /** File upload + Gemini can exceed default proxy/socket timeouts (avoids read ECONNRESET). */
          timeout: 180_000,
          proxyTimeout: 180_000,
          configure(proxy) {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setTimeout(180_000)
            })
            proxy.on('proxyRes', (proxyRes) => {
              proxyRes.setTimeout(180_000)
            })
          },
        },
      },
    },
    plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
