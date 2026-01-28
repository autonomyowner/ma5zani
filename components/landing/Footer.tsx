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
                <span className="text-white font-medium">{t.footer.email}</span> contact@ma5zani.dz
              </p>
              <p className="text-slate-400">
                <span className="text-white font-medium">{t.footer.phone}</span> <span dir="ltr">+213 658 39 96 44</span>
              </p>
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
