'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Language } from './i18n'

export type Theme = 'dark' | 'light'

interface UiPreferencesValue {
  language: Language
  setLanguage: (language: Language) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  isSidebarCollapsed: boolean
  setIsSidebarCollapsed: (collapsed: boolean) => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

const UiPreferencesContext = createContext<UiPreferencesValue | null>(null)

const LANGUAGE_KEY = 'specbot-language'
const THEME_KEY = 'specbot-theme'
const SIDEBAR_COLLAPSED_KEY = 'specbot-sidebar-collapsed'

export function UiPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')
  const [theme, setTheme] = useState<Theme>('dark')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Initial sync
    const storedLanguage = window.localStorage.getItem(LANGUAGE_KEY) as Language | null
    if (storedLanguage) setLanguage(storedLanguage)

    const storedTheme = window.localStorage.getItem(THEME_KEY) as Theme | null
    if (storedTheme) setTheme(storedTheme)

    const storedSidebar = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    if (storedSidebar !== null) {
      setIsSidebarCollapsed(storedSidebar === 'true')
    }
    
    setIsMounted(true)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    window.localStorage.setItem(THEME_KEY, theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, isSidebarCollapsed.toString())
  }, [isSidebarCollapsed])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      theme,
      setTheme,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      isMobileMenuOpen,
      setIsMobileMenuOpen,
    }),
    [language, theme, isSidebarCollapsed, isMobileMenuOpen]
  )

  return <UiPreferencesContext.Provider value={value}>{children}</UiPreferencesContext.Provider>
}

export function useUiPreferences(): UiPreferencesValue {
  const context = useContext(UiPreferencesContext)
  if (!context) {
    throw new Error('useUiPreferences must be used within UiPreferencesProvider')
  }

  return context
}
