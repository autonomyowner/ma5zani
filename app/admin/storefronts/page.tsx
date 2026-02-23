'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function AdminStorefronts() {
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

  const storefronts = useQuery(api.admin.getAllStorefronts, password ? { password } : 'skip')

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
              <Link href="/admin/dashboard" className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 font-medium">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/sellers" className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 font-medium">
                Sellers
              </Link>
            </li>
            <li>
              <Link href="/admin/storefronts" className="block px-4 py-3 rounded-xl bg-[#0054A6] text-white font-medium">
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
              Storefronts
            </h1>
            <p className="text-slate-400 text-sm">
              {storefronts?.length || 0} total storefronts
            </p>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="rounded-2xl p-6 bg-slate-800 border border-slate-700">
              <p className="text-sm text-slate-300 mb-1">Total Storefronts</p>
              <p className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit)' }}>
                {storefronts?.length || 0}
              </p>
            </div>
            <div className="rounded-2xl p-6 bg-slate-800 border border-slate-700">
              <p className="text-sm text-slate-300 mb-1">Published</p>
              <p className="text-3xl font-bold text-[#22B14C]" style={{ fontFamily: 'var(--font-outfit)' }}>
                {storefronts?.filter(s => s.isPublished).length || 0}
              </p>
            </div>
            <div className="rounded-2xl p-6 bg-slate-800 border border-slate-700">
              <p className="text-sm text-slate-300 mb-1">Draft</p>
              <p className="text-3xl font-bold text-[#F7941D]" style={{ fontFamily: 'var(--font-outfit)' }}>
                {storefronts?.filter(s => !s.isPublished).length || 0}
              </p>
            </div>
          </div>

          {/* Storefronts Table */}
          <div className="rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Storefront</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Seller</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Created</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {storefronts?.map((storefront) => (
                    <tr key={storefront._id} className="hover:bg-slate-750">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{storefront.boutiqueName}</p>
                          <p className="text-sm text-slate-300">/{storefront.slug}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white">{storefront.sellerName}</p>
                          <p className="text-sm text-slate-300">{storefront.sellerEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            storefront.isPublished
                              ? 'bg-green-600 text-green-100'
                              : 'bg-yellow-600 text-yellow-100'
                          }`}
                        >
                          {storefront.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {new Date(storefront.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`/${storefront.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            storefront.isPublished
                              ? 'bg-[#0054A6] text-white hover:bg-[#004490]'
                              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                          }`}
                          onClick={(e) => {
                            if (!storefront.isPublished) {
                              e.preventDefault()
                            }
                          }}
                        >
                          Visit Store
                        </a>
                      </td>
                    </tr>
                  ))}
                  {(!storefronts || storefronts.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        No storefronts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
