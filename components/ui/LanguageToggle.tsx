'use client'

import { useLanguage } from '@/lib/LanguageContext'
import { Language } from '@/lib/translations'

const languages: { code: Language; label: string }[] = [
  { code: 'ar', label: 'عربي' },
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
]

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-slate-100 text-sm font-medium">
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
  )
}
