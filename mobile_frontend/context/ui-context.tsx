import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Language } from '../lib/i18n'

export type Theme = 'dark' | 'light'

interface UiContextType {
  language: Language
  setLanguage: (lang: Language) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  isLoaded: boolean
}

const UiContext = createContext<UiContextType | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = '@spex_ui_language'
const THEME_STORAGE_KEY = '@spex_ui_theme'

export function UiPreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [theme, setThemeState] = useState<Theme>('dark')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [savedLanguage, savedTheme] = await Promise.all([
          AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
          AsyncStorage.getItem(THEME_STORAGE_KEY)
        ])

        if (savedLanguage === 'en' || savedLanguage === 'th') {
          setLanguageState(savedLanguage)
        }
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setThemeState(savedTheme)
        }
      } catch (error) {
        console.error('Failed to load UI preferences:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadPreferences()
  }, [])

  const setLanguage = async (newLang: Language) => {
    try {
      setLanguageState(newLang)
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang)
    } catch (error) {
      console.error('Failed to save language preference:', error)
    }
  }

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme)
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme)
    } catch (error) {
      console.error('Failed to save theme preference:', error)
    }
  }

  return (
    <UiContext.Provider value={{ language, setLanguage, theme, setTheme, isLoaded }}>
      {children}
    </UiContext.Provider>
  )
}

export function useUiPreferences() {
  const context = useContext(UiContext)
  if (context === undefined) {
    throw new Error('useUiPreferences must be used within a UiPreferencesProvider')
  }
  return context
}
