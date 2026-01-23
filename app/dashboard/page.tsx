'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { useUser, UserButton } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import Sidebar from '@/components/dashboard/Sidebar'
import StatsCards from '@/components/dashboard/StatsCards'
import OrdersTable from '@/components/dashboard/OrdersTable'
import ProductsList from '@/components/dashboard/ProductsList'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const stats = useQuery(api.stats.getDashboardStats)
  const orders = useQuery(api.orders.getOrders, {})
  const products = useQuery(api.products.getProducts)

  // Show loading state
  if (!isLoaded || seller === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    )
  }

  // Redirect to onboarding if no seller profile
  if (seller === null && user) {
    router.push('/onboarding')
    return null
  }

  const displayStats = stats || {
    ordersToday: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
    totalProducts: 0,
  }

  const planLabels: Record<string, string> = {
    basic: 'Basic Plan',
    plus: 'Plus Plan',
    gros: 'Gros Plan',
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar seller={seller} />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div>
            <h1
              className="text-2xl font-bold text-[#0054A6]"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
            >
              Dashboard
            </h1>
            <p className="text-slate-500 text-sm">
              Welcome back, {seller?.name || user?.firstName || 'Seller'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {seller && (
              <span className="px-4 py-2 bg-[#22B14C]/10 text-[#22B14C] rounded-lg text-sm font-medium">
                {planLabels[seller.plan] || 'Active'}
              </span>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8">
          {/* Stats */}
          <StatsCards stats={displayStats} />

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <button className="p-4 bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-[#0054A6] hover:bg-[#0054A6]/5 transition-all text-left">
              <span
                className="text-lg font-bold text-[#0054A6] block"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                + Add Product
              </span>
              <span className="text-sm text-slate-500">Upload new inventory</span>
            </button>
            <button className="p-4 bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-[#F7941D] hover:bg-[#F7941D]/5 transition-all text-left">
              <span
                className="text-lg font-bold text-[#F7941D] block"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                + Create Order
              </span>
              <span className="text-sm text-slate-500">Manual order entry</span>
            </button>
            <button className="p-4 bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-[#00AEEF] hover:bg-[#00AEEF]/5 transition-all text-left">
              <span
                className="text-lg font-bold text-[#00AEEF] block"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                View Analytics
              </span>
              <span className="text-sm text-slate-500">Sales & performance</span>
            </button>
          </div>

          {/* Orders Table */}
          <OrdersTable orders={orders || []} />

          {/* Products List */}
          <ProductsList products={products || []} />
        </div>
      </main>
    </div>
  )
}
