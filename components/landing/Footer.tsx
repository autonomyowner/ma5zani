'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/lib/LanguageContext'

export default function Footer() {
  const { t, language } = useLanguage()

  const footerLinks = {
    product: [
      { label: t.footer.productLinks.features, href: '#features' },
      { label: t.footer.productLinks.pricing, href: '#pricing' },
      { label: t.footer.productLinks.howItWorks, href: '#how-it-works' },
    ],
    company: [
      { label: t.footer.companyLinks.about, href: '#' },
      { label: t.footer.companyLinks.careers, href: '#' },
      { label: t.footer.companyLinks.blog, href: '#' },
      { label: t.footer.companyLinks.contact, href: '#' },
    ],
    support: [
      { label: t.footer.supportLinks.helpCenter, href: '#' },
      { label: t.footer.supportLinks.sellerGuide, href: '#' },
      { label: t.footer.supportLinks.apiDocs, href: '#' },
      { label: t.footer.supportLinks.status, href: '#' },
    ],
    legal: [
      { label: t.footer.legalLinks.privacy, href: '#' },
      { label: t.footer.legalLinks.terms, href: '#' },
      { label: t.footer.legalLinks.cookies, href: '#' },
    ],
  }

  const wilayas = language === 'ar'
    ? ['الجزائر', 'وهران', 'قسنطينة', 'عنابة', 'البليدة', 'سطيف', 'باتنة', 'تلمسان', 'بجاية', 'تيزي وزو', 'مستغانم', 'بسكرة']
    : ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Setif', 'Batna', 'Tlemcen', 'Bejaia', 'Tizi Ouzou', 'Mostaganem', 'Biskra']

  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="ma5zani"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
              <span
                className="text-3xl font-bold text-white"
                style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
              >
                ma5zani
              </span>
            </Link>
            <p className="text-slate-400 mb-6 max-w-sm">
              {t.footer.description}
            </p>
            <div className="space-y-2">
              <p className="text-slate-400">
                <span className="text-white font-medium">{t.footer.email}</span> contact@ma5zani.com
              </p>
              <p className="text-slate-400">
                <span className="text-white font-medium">{t.footer.phone}</span> <span dir="ltr">+213 697 33 94 50</span>
              </p>
            </div>
            {/* Social Media */}
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://www.facebook.com/profile.php?id=61587224181474"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-[#1877F2] hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/m5zani/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4
              className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
            >
              {t.footer.product}
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-400 hover:text-[#00AEEF] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4
              className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
            >
              {t.footer.company}
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-400 hover:text-[#00AEEF] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4
              className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
            >
              {t.footer.support}
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-400 hover:text-[#00AEEF] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4
              className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
            >
              {t.footer.legal}
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-400 hover:text-[#00AEEF] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Wilayas */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <h4
            className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
            style={{ fontFamily: 'var(--font-outfit), var(--font-cairo), sans-serif' }}
          >
            {t.footer.deliverTo}
          </h4>
          <div className="flex flex-wrap gap-2">
            {wilayas.map((wilaya) => (
              <span
                key={wilaya}
                className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-400"
              >
                {wilaya}
              </span>
            ))}
            <span className="px-3 py-1 bg-[#00AEEF]/20 text-[#00AEEF] rounded-full text-sm font-medium">
              {t.footer.moreWilayas}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              {t.footer.copyright}
            </p>
            <p className="text-slate-500 text-sm">
              {t.footer.madeIn}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
