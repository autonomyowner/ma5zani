'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Language, Translations } from './translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
  dir: 'rtl' | 'ltr'
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default to Arabic
  const [language, setLanguage] = useState<Language>('ar')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check localStorage for saved preference
    try {
      const saved = localStorage.getItem('ma5zani-lang') as Language
      if (saved && (saved === 'ar' || saved === 'en' || saved === 'fr')) {
        setLanguage(saved)
      }
    } catch {
      // localStorage may be unavailable
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('ma5zani-lang', language)
      } catch {
        // localStorage may be unavailable
      }
      // Update HTML attributes
      document.documentElement.lang = language
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    }
  }, [language, mounted])

  const value = {
    language,
    setLanguage,
    t: translations[language],
    dir: language === 'ar' ? 'rtl' : 'ltr' as 'rtl' | 'ltr',
  }

  // Always render children with default language to avoid hydration mismatch.
  // The language will update on the client once localStorage is read.
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
