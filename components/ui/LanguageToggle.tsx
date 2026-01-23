'use client'

import { useLanguage } from '@/lib/LanguageContext'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <button
      onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium"
      aria-label="Toggle language"
    >
      <span className={`${language === 'ar' ? 'text-[#0054A6] font-bold' : 'text-slate-500'}`}>
        عربي
      </span>
      <span className="text-slate-300">|</span>
      <span className={`${language === 'en' ? 'text-[#0054A6] font-bold' : 'text-slate-500'}`}>
        EN
      </span>
    </button>
  )
}
