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
    const saved = localStorage.getItem('ma5zani-lang') as Language
    if (saved && (saved === 'ar' || saved === 'en')) {
      setLanguage(saved)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('ma5zani-lang', language)
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

  // Prevent flash of wrong language
  if (!mounted) {
    return null
  }

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
