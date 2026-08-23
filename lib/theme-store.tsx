'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { setMuted, isMuted } from '@/lib/audio-engine'

export type ThemeId = 'matrix' | 'amber' | 'cyan' | 'red'

export interface ThemeDefinition {
  id: ThemeId
  label: string
  shortLabel: string
  cssClass: string
  accentColor: string
}

export const THEMES: ThemeDefinition[] = [
  { id: 'matrix', label: 'MATRIX CLASSIC', shortLabel: '🟢 MATRIX', cssClass: 'theme-matrix', accentColor: '#00ff66' },
  { id: 'amber', label: 'CYBERPUNK AMBER', shortLabel: '🟡 AMBER', cssClass: 'theme-amber', accentColor: '#ffb000' },
  { id: 'cyan', label: 'DEEP OPS CYAN', shortLabel: '🔵 CYAN', cssClass: 'theme-cyan', accentColor: '#00e0d0' },
  { id: 'red', label: 'DEFCON 1 // RED ALERT', shortLabel: '🔴 DEFCON', cssClass: 'theme-red', accentColor: '#ff0033' },
]

interface ThemeContextType {
  theme: ThemeId
  setTheme: (id: ThemeId) => void
  crtEnabled: boolean
  toggleCrt: () => void
  sfxEnabled: boolean
  toggleSfx: () => void
  currentThemeDef: ThemeDefinition
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('matrix')
  const [crtEnabled, setCrtEnabled] = useState(false)
  const [sfxEnabled, setSfxEnabled] = useState(true)

  // Apply theme class and CSS custom properties to <html>
  useEffect(() => {
    const root = document.documentElement
    // Remove all theme classes
    THEMES.forEach((t) => root.classList.remove(t.cssClass))
    const def = THEMES.find((t) => t.id === theme)!
    root.classList.add(def.cssClass)
  }, [theme])

  // Apply CRT class to body
  useEffect(() => {
    if (crtEnabled) {
      document.body.classList.add('crt-fx')
    } else {
      document.body.classList.remove('crt-fx')
    }
  }, [crtEnabled])

  // Sync sfx with audio engine mute
  useEffect(() => {
    setMuted(!sfxEnabled)
  }, [sfxEnabled])

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id)
  }, [])

  const toggleCrt = useCallback(() => setCrtEnabled((v) => !v), [])
  const toggleSfx = useCallback(() => setSfxEnabled((v) => !v), [])

  const currentThemeDef = THEMES.find((t) => t.id === theme)!

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        crtEnabled,
        toggleCrt,
        sfxEnabled,
        toggleSfx,
        currentThemeDef,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
