import { createContext, useContext } from 'react'

export type ThemeId = 'dusk' | 'daylight' | 'moonlight' | 'sepia'

export const THEMES: {
  id: ThemeId
  label: string
  available: boolean
  swatch: [string, string]
}[] = [
  { id: 'dusk', label: 'Dusk', available: true, swatch: ['#141110', '#EAB27A'] },
  { id: 'daylight', label: 'Daylight', available: true, swatch: ['#F2F3F2', '#343A40'] },
  { id: 'moonlight', label: 'Moonlight', available: false, swatch: ['#0F1218', '#D8B88C'] },
  { id: 'sepia', label: 'Sepia', available: false, swatch: ['#EAD9BC', '#9A3F1F'] },
]

export const THEME_STORAGE_KEY = 'theme'

export const ThemeContext = createContext<{
  theme: ThemeId
  setTheme: (t: ThemeId) => void
} | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
