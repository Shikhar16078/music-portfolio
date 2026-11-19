import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/**
 * Serves `api/<name>.ts` during `npm run dev` the way Vercel does in production
 * (GET handlers only), with variables from `.env.local` available on process.env.
 */
function localApi(): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ''))
      server.middlewares.use(async (req, res, next) => {
        const name = /^\/api\/([\w-]+)/.exec(req.url ?? '')?.[1]
        if (!name || req.method !== 'GET') return next()
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.ts`)
          const response: Response = await mod.GET(new Request(`http://localhost${req.url}`))
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
