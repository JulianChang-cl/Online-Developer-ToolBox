/**
 * useTheme hook for theme state management and persistence
 * Manages theme state with localStorage persistence
 * Only supports light and dark modes (no system preference)
 */

import { useState, useEffect } from 'react'
import { getTheme, setTheme as saveTheme } from '@/utils/storage'
import type { Theme } from '@/types/Preferences'

interface UseThemeReturn {
  /** Current theme (light or dark only) */
  theme: 'light' | 'dark'
  /** Set theme */
  setTheme: (theme: 'light' | 'dark') => void
  /** Whether dark mode is active */
  isDark: boolean
}

export const useTheme = (): UseThemeReturn => {
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const savedTheme = getTheme()
    // Convert 'system' to 'light' for backwards compatibility
    return savedTheme === 'system' ? 'light' : (savedTheme as 'light' | 'dark')
  })

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#111827' : '#ffffff'
      )
    }
  }, [theme])

  // Set theme and persist
  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme)
    saveTheme(newTheme as Theme)
  }

  return {
    theme,
    setTheme,
    isDark: theme === 'dark',
  }
}
