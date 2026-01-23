'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { Doc } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import LanguageToggle from '@/components/ui/LanguageToggle'

interface SidebarProps {
  seller: Doc<'sellers'> | null | undefined
}

export default function Sidebar({ seller }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems = [
    { label: t.dashboard.dashboardNav, href: '/dashboard' },
    { label: t.dashboard.ordersNav, href: '/dashboard/orders' },
    { label: t.dashboard.productsNav, href: '/dashboard/products' },
    { label: t.dashboard.inventoryNav, href: '/dashboard/inventory' },
    { label: t.dashboard.analyticsNav, href: '/dashboard/analytics' },
    { label: t.dashboard.settingsNav, href: '/dashboard/settings' },
  ]

  const planLabels: Record<string, string> = {
    basic: t.dashboard.basicPlan,
    plus: t.dashboard.plusPlan,
    gros: t.dashboard.grosPlan,
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-40">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="ma5zani"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <span
            className="text-2xl font-bold text-[#0054A6]"
            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
          >
            ma5zani
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-[#0054A6] text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#0054A6]'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3 px-4">
          <LanguageToggle />
        </div>
        <div className="px-4 py-3">
          <p className="font-medium text-slate-900" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
            {seller?.name || t.dashboard.loading}
          </p>
          <p className="text-sm text-slate-500">
            {seller ? planLabels[seller.plan] : '...'}
          </p>
        </div>
        <SignOutButton>
          <button className="w-full text-left px-4 py-3 text-slate-600 hover:text-red-600 font-medium transition-colors">
            {t.dashboard.signOut}
          </button>
        </SignOutButton>
      </div>
    </aside>
  )
}
