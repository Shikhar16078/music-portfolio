import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { THEMES, THEME_STORAGE_KEY, ThemeContext, type ThemeId } from '@/lib/theme-config'

function readInitialTheme(): ThemeId {
  const current = document.documentElement.dataset.theme
  return THEMES.some((t) => t.id === current && t.available) ? (current as ThemeId) : 'dusk'
}

/** Applies the theme as `data-theme` on <html> and remembers the choice. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(readInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg)
  }, [theme])

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t)
    } catch {
      // storage unavailable (private mode): theme still applies for this visit
    }
  }, [])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}
