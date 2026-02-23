'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

export default function AdminReferralsPage() {
  const router = useRouter()
  const [password, setPassword] = useState<string | null>(null)
  const [payingId, setPayingId] = useState<string | null>(null)

  useEffect(() => {
    const savedPassword = sessionStorage.getItem('adminPassword')
    if (!savedPassword) {
      router.push('/admin')
    } else {
      setPassword(savedPassword)
    }
  }, [router])

  const referrals = useQuery(api.admin.getAllReferrals, password ? { password } : 'skip')
  const markPaid = useMutation(api.admin.markReferralPaid)
  const backfillCodes = useMutation(api.admin.backfillReferralCodes)

  const handleMarkPaid = async (referralId: Id<'referrals'>) => {
    if (!password) return
    setPayingId(referralId)
    try {
      await markPaid({ password, referralId })
    } catch (error) {
      console.error('Failed to mark as paid:', error)
    }
    setPayingId(null)
  }

  const handleBackfill = async () => {
    if (!password) return
    try {
      const result = await backfillCodes({ password })
      alert(`Generated referral codes for ${result.updated} sellers`)
    } catch (error) {
      console.error('Failed to backfill:', error)
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

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-600 text-green-100'
      case 'activated': return 'bg-orange-600 text-orange-100'
      default: return 'bg-slate-600 text-slate-200'
    }
  }

  const totalEarnings = referrals
    ?.filter((r) => r.status === 'activated' || r.status === 'paid')
    .reduce((sum, r) => sum + r.referrerReward, 0) ?? 0
  const pendingPayments = referrals?.filter((r) => r.status === 'activated').length ?? 0
  const totalPaid = referrals?.filter((r) => r.status === 'paid').length ?? 0

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
              <Link href="/admin/referrals" className="block px-4 py-3 rounded-xl bg-[#0054A6] text-white font-medium">
                Referrals
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
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit)' }}>
                Referral Program
              </h1>
              <p className="text-slate-400 mt-1">Track referrals and manage payouts</p>
            </div>
            <button
              onClick={handleBackfill}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-colors"
            >
              Backfill Codes
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">Total Referrals</p>
              <p className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit)' }}>
                {referrals?.length ?? 0}
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">Pending Payouts</p>
              <p className="text-3xl font-bold text-orange-400" style={{ fontFamily: 'var(--font-outfit)' }}>
                {pendingPayments} <span className="text-lg">({pendingPayments * 500} DA)</span>
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">Total Paid</p>
              <p className="text-3xl font-bold text-green-400" style={{ fontFamily: 'var(--font-outfit)' }}>
                {totalPaid} <span className="text-lg">({totalPaid * 500} DA)</span>
              </p>
            </div>
          </div>

          {/* Referrals Table */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Referrer</th>
                  <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Referred</th>
                  <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Status</th>
                  <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Reward</th>
                  <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Date</th>
                  <th className="text-left px-6 py-4 text-slate-400 text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {referrals?.map((r) => (
                  <tr key={r._id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <p className="text-white text-sm font-medium">{r.referrerName}</p>
                      <p className="text-slate-400 text-xs">{r.referrerEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white text-sm font-medium">{r.referredName}</p>
                      <p className="text-slate-400 text-xs">{r.referredEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white text-sm">{r.referrerReward} DA</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {r.status === 'activated' && (
                        <button
                          onClick={() => handleMarkPaid(r._id)}
                          disabled={payingId === r._id}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-500 transition-colors disabled:opacity-50"
                        >
                          {payingId === r._id ? 'Paying...' : 'Mark Paid'}
                        </button>
                      )}
                      {r.status === 'paid' && r.paidAt && (
                        <span className="text-green-400 text-xs">
                          Paid {new Date(r.paidAt).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!referrals || referrals.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No referrals yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
