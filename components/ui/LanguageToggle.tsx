'use client'

import { useLanguage } from '@/lib/LanguageContext'
import { Language } from '@/lib/translations'
import { useState, useRef, useEffect } from 'react'

const languages: { code: Language; label: string }[] = [
  { code: 'ar', label: 'عربي' },
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
]

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLabel = languages.find((l) => l.code === language)?.label || 'EN'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      {/* Desktop: inline toggle */}
      <div className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full bg-slate-100 text-sm font-medium">
        {languages.map((lang, i) => (
          <span key={lang.code} className="flex items-center">
            <button
              onClick={() => setLanguage(lang.code)}
              className={`px-1.5 transition-colors ${
                language === lang.code ? 'text-[#0054A6] font-bold' : 'text-slate-500 hover:text-slate-700'
              }`}
              aria-label={`Switch to ${lang.label}`}
            >
              {lang.label}
            </button>
            {i < languages.length - 1 && <span className="text-slate-300">|</span>}
          </span>
        ))}
      </div>

      {/* Mobile: dropdown */}
      <div className="md:hidden relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 text-sm font-bold text-[#0054A6]"
          aria-label="Change language"
        >
          {currentLabel}
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {open && (
          <div className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-lg border border-slate-100 py-1 min-w-[80px] z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setOpen(false)
                }}
                className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                  language === lang.code
                    ? 'text-[#0054A6] font-bold bg-slate-50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
