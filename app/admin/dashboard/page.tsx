'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function AdminDashboard() {
  const router = useRouter()
  const [password, setPassword] = useState<string | null>(null)

  useEffect(() => {
    const savedPassword = sessionStorage.getItem('adminPassword')
    if (!savedPassword) {
      router.push('/admin')
    } else {
      setPassword(savedPassword)
    }
  }, [router])

  const stats = useQuery(api.admin.getAdminStats, password ? { password } : 'skip')

  const handleLogout = () => {
    sessionStorage.removeItem('adminPassword')
    router.push('/admin')
  }

  if (!password) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-800 border-r border-slate-700 z-40">
        <div className="h-20 flex items-center px-6 border-b border-slate-700">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="ma5zani" width={40} height={40} className="h-10 w-auto" />
            <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit)' }}>
              Admin
            </span>
          </Link>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <Link href="/admin/dashboard" className="block px-4 py-3 rounded-xl bg-[#0054A6] text-white font-medium">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/sellers" className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 font-medium">
                Sellers
              </Link>
            </li>
            <li>
              <Link href="/admin/storefronts" className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 font-medium">
                Storefronts
              </Link>
            </li>
            <li>
              <Link href="/admin/orders" className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 font-medium">
                All Orders
              </Link>
            </li>
            <li>
              <Link href="/admin/products" className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 font-medium">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/admin/chats" className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 font-medium">
                Support Chats
              </Link>
            </li>
            <li>
              <Link href="/admin/referrals" className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 font-medium">
                Referrals
              </Link>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-red-400 hover:text-red-300 font-medium text-left"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <header className="h-20 bg-slate-800 border-b border-slate-700 flex items-center px-8">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit)' }}>
              Admin Dashboard
            </h1>
            <p className="text-slate-300 text-sm">Platform overview and management</p>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <div className="rounded-2xl p-6 bg-slate-800 border border-slate-700">
              <p className="text-sm text-slate-300 mb-1">Total Sellers</p>
              <p className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit)' }}>
                {stats?.totalSellers || 0}
              </p>
            </div>
            <div className="rounded-2xl p-6 bg-slate-800 border border-slate-700">
              <p className="text-sm text-slate-300 mb-1">Storefronts</p>
              <p className="text-3xl font-bold text-[#00AEEF]" style={{ fontFamily: 'var(--font-outfit)' }}>
                {stats?.totalStorefronts || 0}
              </p>
              <p className="text-sm text-slate-300">{stats?.publishedStorefronts || 0} published</p>
            </div>
            <div className="rounded-2xl p-6 bg-slate-800 border border-slate-700">
              <p className="text-sm text-slate-300 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-[#00AEEF]" style={{ fontFamily: 'var(--font-outfit)' }}>
                {stats?.totalOrders || 0}
              </p>
            </div>
            <div className="rounded-2xl p-6 bg-slate-800 border border-slate-700">
              <p className="text-sm text-slate-300 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-[#F7941D]" style={{ fontFamily: 'var(--font-outfit)' }}>
                {stats?.totalProducts || 0}
              </p>
            </div>
            <div className="rounded-2xl p-6 bg-slate-800 border border-slate-700">
              <p className="text-sm text-slate-300 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-[#22B14C]" style={{ fontFamily: 'var(--font-outfit)' }}>
                {(stats?.totalRevenue || 0).toLocaleString()}
              </p>
              <p className="text-sm text-slate-300">DZD</p>
            </div>
          </div>

          {/* Plan Distribution */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl p-6 bg-slate-800 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'var(--font-outfit)' }}>
                Sellers by Plan
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded-xl">
                  <span className="text-slate-300">Basic</span>
                  <span className="text-xl font-bold text-white">{stats?.planCounts?.basic || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded-xl">
                  <span className="text-slate-300">Plus</span>
                  <span className="text-xl font-bold text-[#00AEEF]">{stats?.planCounts?.plus || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded-xl">
                  <span className="text-slate-300">Gros</span>
                  <span className="text-xl font-bold text-[#F7941D]">{stats?.planCounts?.gros || 0}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6 bg-slate-800 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'var(--font-outfit)' }}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link href="/admin/sellers" className="block w-full px-4 py-3 rounded-xl text-slate-200 hover:text-white hover:bg-slate-700 font-medium text-left transition-colors">
                  Manage Sellers
                </Link>
                <Link href="/admin/storefronts" className="block w-full px-4 py-3 rounded-xl text-slate-200 hover:text-white hover:bg-slate-700 font-medium text-left transition-colors">
                  View Storefronts ({stats?.publishedStorefronts || 0} live)
                </Link>
                <Link href="/admin/orders" className="block w-full px-4 py-3 rounded-xl text-slate-200 hover:text-white hover:bg-slate-700 font-medium text-left transition-colors">
                  View All Orders ({stats?.pendingOrders || 0} pending)
                </Link>
                <Link href="/admin/products" className="block w-full px-4 py-3 rounded-xl text-slate-200 hover:text-white hover:bg-slate-700 font-medium text-left transition-colors">
                  View All Products
                </Link>
                <Link href="/" className="block w-full px-4 py-3 rounded-xl text-slate-200 hover:text-white hover:bg-slate-700 font-medium text-left transition-colors">
                  View Live Site
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
