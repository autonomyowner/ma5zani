'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { SignOutButton } from '@clerk/nextjs'
import { Doc } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import LanguageToggle from '@/components/ui/LanguageToggle'

interface DashboardLayoutProps {
  seller: Doc<'sellers'> | null | undefined
  children: React.ReactNode
  title: string
  subtitle?: string
  headerActions?: React.ReactNode
}

export default function DashboardLayout({
  seller,
  children,
  title,
  subtitle,
  headerActions,
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navItems = [
    { label: t.dashboard.dashboardNav, href: '/dashboard' },
    { label: t.dashboard.ordersNav, href: '/dashboard/orders' },
    { label: t.dashboard.productsNav, href: '/dashboard/products' },
    { label: t.dashboard.storefrontNav, href: '/dashboard/storefront' },
    { label: t.chatbot.aiAssistant, href: '/dashboard/chatbot' },
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
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 lg:h-20 flex items-center justify-between px-4 lg:px-6 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="ma5zani"
              width={40}
              height={40}
              className="h-8 lg:h-10 w-8 lg:w-10 rounded-full object-cover"
            />
            <span
              className="text-xl lg:text-2xl font-bold text-[#0054A6]"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
            >
              ma5zani
            </span>
          </Link>
          {/* Close button on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 lg:p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl font-medium transition-all text-sm lg:text-base ${
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
        <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center justify-between mb-2 lg:mb-3 px-3 lg:px-4">
            <LanguageToggle />
          </div>
          <div className="px-3 lg:px-4 py-2 lg:py-3">
            <p className="font-medium text-slate-900 text-sm lg:text-base truncate" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              {seller?.name || t.dashboard.loading}
            </p>
            <p className="text-xs lg:text-sm text-slate-500">
              {seller ? planLabels[seller.plan] : '...'}
            </p>
          </div>
          <SignOutButton>
            <button className="w-full text-left px-3 lg:px-4 py-2 lg:py-3 text-slate-600 hover:text-red-600 font-medium transition-colors text-sm lg:text-base">
              {t.dashboard.signOut}
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="h-14 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-[#0054A6] hover:bg-slate-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1
                className="text-lg lg:text-2xl font-bold text-[#0054A6]"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                {title}
              </h1>
              {subtitle && (
                <p className="text-slate-500 text-xs lg:text-sm hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {headerActions}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
