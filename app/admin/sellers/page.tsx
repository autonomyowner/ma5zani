'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

export default function AdminSellersPage() {
  const router = useRouter()
  const [password, setPassword] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const savedPassword = sessionStorage.getItem('adminPassword')
    if (!savedPassword) {
      router.push('/admin')
    } else {
      setPassword(savedPassword)
    }
  }, [router])

  const sellers = useQuery(api.admin.getAllSellers, password ? { password } : 'skip')
  const updatePlan = useMutation(api.admin.updateSellerPlan)
  const deleteSeller = useMutation(api.admin.deleteSeller)
  const activateSeller = useMutation(api.admin.activateSeller)

  const handlePlanChange = async (sellerId: Id<'sellers'>, plan: 'basic' | 'plus' | 'gros') => {
    if (!password) return
    setUpdatingId(sellerId)
    try {
      await updatePlan({ password, sellerId, plan })
    } catch (error) {
      console.error('Failed to update plan:', error)
    }
    setUpdatingId(null)
  }

  const handleActivate = async (sellerId: Id<'sellers'>, currentStatus: boolean) => {
    if (!password) return
    setUpdatingId(sellerId)
    try {
      await activateSeller({ password, sellerId, isActivated: !currentStatus })
    } catch (error) {
      console.error('Failed to toggle activation:', error)
    }
    setUpdatingId(null)
  }

  const handleDelete = async (sellerId: Id<'sellers'>, name: string) => {
    if (!password) return
    if (confirm(`Delete seller "${name}" and all their data? This cannot be undone.`)) {
      try {
        await deleteSeller({ password, sellerId })
      } catch (error) {
        console.error('Failed to delete seller:', error)
      }
    }
  }

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

  const getPlanVariant = (plan: string) => {
    switch (plan) {
      case 'gros': return 'warning'
      case 'plus': return 'info'
      default: return 'default'
    }
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
              <Link href="/admin/sellers" className="block px-4 py-3 rounded-xl bg-[#0054A6] text-white font-medium">
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
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button onClick={handleLogout} className="w-full px-4 py-3 text-red-400 hover:text-red-300 font-medium text-left">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <header className="h-20 bg-slate-800 border-b border-slate-700 flex items-center px-8">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit)' }}>
              Manage Sellers
            </h1>
            <p className="text-slate-300 text-sm">{sellers?.length || 0} registered sellers</p>
          </div>
        </header>

        <div className="p-8">
          <div className="rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden">
            {sellers?.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                No sellers registered yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-700">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {sellers?.map((seller) => (
                      <tr key={seller._id} className="hover:bg-slate-700/50">
                        <td className="px-6 py-4">
                          <span className="font-medium text-white">{seller.name}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{seller.email}</td>
                        <td className="px-6 py-4 text-slate-300">{seller.phone || '-'}</td>
                        <td className="px-6 py-4">
                          <select
                            value={seller.plan}
                            onChange={(e) => handlePlanChange(seller._id, e.target.value as 'basic' | 'plus' | 'gros')}
                            disabled={updatingId === seller._id}
                            className="px-3 py-1.5 rounded-lg bg-slate-600 text-white border border-slate-500 focus:outline-none focus:border-[#00AEEF] disabled:opacity-50"
                          >
                            <option value="basic">Basic</option>
                            <option value="plus">Plus</option>
                            <option value="gros">Gros</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            seller.isActivated
                              ? 'bg-green-600 text-green-100'
                              : 'bg-slate-600 text-slate-300'
                          }`}>
                            {seller.isActivated ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300 text-sm">
                          {new Date(seller.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleActivate(seller._id, !!seller.isActivated)}
                              disabled={updatingId === seller._id}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 ${
                                seller.isActivated
                                  ? 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {seller.isActivated ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(seller._id, seller.name)}
                              className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
