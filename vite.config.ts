import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parseEnv } from 'node:util'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/**
 * Serves the YouTube endpoint during local development using the local server key.
 */
function localApi(): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      const { envDir, mode } = server.config
      const localEnvPath = envDir && path.join(envDir, '.env.local')
      // Vite config reloads can keep an older key in process.env.
      const localEnv =
        localEnvPath && existsSync(localEnvPath) ? parseEnv(readFileSync(localEnvPath, 'utf8')) : {}
      const youtubeKey =
        localEnv.YOUTUBE_API_KEY ??
        (envDir
          ? loadEnv(mode, envDir, 'YOUTUBE_API_KEY').YOUTUBE_API_KEY
          : process.env.YOUTUBE_API_KEY)
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split('?')[0] !== '/api/videos' || req.method !== 'GET') return next()
        try {
          const mod = await server.ssrLoadModule('/api/videos.ts')
          const response: Response = await mod.getVideos(youtubeKey)
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localApi()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/__sanity/query': {
        target: 'https://t1hamr9e.api.sanity.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/__sanity\/query/, '/v2025-01-01/data/query/production'),
      },
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks: app changes don't invalidate the browser cache for these
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            {
              name: 'motion',
              test: /node_modules[\\/](motion|motion-dom|motion-utils|framer-motion)[\\/]/,
            },
            {
              name: 'ui',
              test: /node_modules[\\/](radix-ui|@radix-ui|lucide-react|embla-carousel[\w-]*)[\\/]/,
            },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
