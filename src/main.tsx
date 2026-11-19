import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PlayerProvider } from '@/lib/player'
import { TheaterProvider } from '@/components/site/video-theater'
import { ThemeProvider } from '@/lib/theme'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PlayerProvider>
          <TheaterProvider>
            {/* Respect the OS "reduce motion" setting everywhere */}
            <MotionConfig reducedMotion="user">
              <App />
            </MotionConfig>
          </TheaterProvider>
        </PlayerProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
