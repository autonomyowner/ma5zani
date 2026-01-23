'use client'

import Link from 'next/link'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import LanguageToggle from '@/components/ui/LanguageToggle'
import { useLanguage } from '@/lib/LanguageContext'
import { useState } from 'react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t, dir } = useLanguage()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="ma5zani"
              width={50}
              height={50}
              className="h-12 w-auto"
            />
            <span
              className="text-2xl font-bold text-[#0054A6]"
              style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
            >
              ma5zani
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-slate-600 hover:text-[#0054A6] transition-colors font-medium">
              {t.nav.features}
            </Link>
            <Link href="#how-it-works" className="text-slate-600 hover:text-[#0054A6] transition-colors font-medium">
              {t.nav.howItWorks}
            </Link>
            <Link href="#pricing" className="text-slate-600 hover:text-[#0054A6] transition-colors font-medium">
              {t.nav.pricing}
            </Link>
            <Link href="#testimonials" className="text-slate-600 hover:text-[#0054A6] transition-colors font-medium">
              {t.nav.testimonials}
            </Link>
          </div>

          {/* CTA Buttons + Language Toggle */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">{t.nav.login}</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm">{t.nav.getStarted}</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <LanguageToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 hover:text-[#0054A6]"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`h-0.5 w-full bg-current transform transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`h-0.5 w-full bg-current transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`h-0.5 w-full bg-current transform transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link href="#features" className="text-slate-600 hover:text-[#0054A6] font-medium py-2">
                {t.nav.features}
              </Link>
              <Link href="#how-it-works" className="text-slate-600 hover:text-[#0054A6] font-medium py-2">
                {t.nav.howItWorks}
              </Link>
              <Link href="#pricing" className="text-slate-600 hover:text-[#0054A6] font-medium py-2">
                {t.nav.pricing}
              </Link>
              <Link href="#testimonials" className="text-slate-600 hover:text-[#0054A6] font-medium py-2">
                {t.nav.testimonials}
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                <Link href="/login">
                  <Button variant="ghost" size="md" className="w-full">{t.nav.login}</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="md" className="w-full">{t.nav.getStarted}</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
