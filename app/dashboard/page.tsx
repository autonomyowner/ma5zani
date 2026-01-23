'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { useUser, UserButton } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { useLanguage } from '@/lib/LanguageContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StatsCards from '@/components/dashboard/StatsCards'
import OrdersTable from '@/components/dashboard/OrdersTable'
import ProductsList from '@/components/dashboard/ProductsList'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { t } = useLanguage()
  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const stats = useQuery(api.stats.getDashboardStats)
  const orders = useQuery(api.orders.getOrders, {})
  const products = useQuery(api.products.getProducts)

  if (!isLoaded || seller === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">{t.dashboard.loading}</div>
      </div>
    )
  }

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
    basic: t.dashboard.basicPlan,
    plus: t.dashboard.plusPlan,
    gros: t.dashboard.grosPlan,
  }

  return (
    <DashboardLayout
      seller={seller}
      title={t.dashboard.title}
      subtitle={`${t.dashboard.welcomeBack}, ${seller?.name || user?.firstName || 'Seller'}`}
      headerActions={
        <>
          {seller && (
            <span className="hidden sm:inline-flex px-3 lg:px-4 py-1.5 lg:py-2 bg-[#22B14C]/10 text-[#22B14C] rounded-lg text-xs lg:text-sm font-medium">
              {planLabels[seller.plan] || 'Active'}
            </span>
          )}
          <UserButton afterSignOutUrl="/" />
        </>
      }
    >
      <div className="space-y-4 lg:space-y-8">
        <StatsCards stats={displayStats} />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <button
            onClick={() => router.push('/dashboard/products')}
            className="p-3 lg:p-4 bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-[#0054A6] hover:bg-[#0054A6]/5 transition-all text-left"
          >
            <span
              className="text-base lg:text-lg font-bold text-[#0054A6] block"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
            >
              {t.dashboard.addProduct}
            </span>
            <span className="text-xs lg:text-sm text-slate-500">{t.dashboard.uploadInventory}</span>
          </button>
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="p-3 lg:p-4 bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-[#F7941D] hover:bg-[#F7941D]/5 transition-all text-left"
          >
            <span
              className="text-base lg:text-lg font-bold text-[#F7941D] block"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
            >
              {t.dashboard.createOrder}
            </span>
            <span className="text-xs lg:text-sm text-slate-500">{t.dashboard.manualEntry}</span>
          </button>
          <button
            onClick={() => router.push('/dashboard/analytics')}
            className="p-3 lg:p-4 bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-[#00AEEF] hover:bg-[#00AEEF]/5 transition-all text-left sm:col-span-2 lg:col-span-1"
          >
            <span
              className="text-base lg:text-lg font-bold text-[#00AEEF] block"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
            >
              {t.dashboard.viewAnalytics}
            </span>
            <span className="text-xs lg:text-sm text-slate-500">{t.dashboard.salesPerformance}</span>
          </button>
        </div>

        <OrdersTable orders={orders || []} />
        <ProductsList products={products || []} />
      </div>
    </DashboardLayout>
  )
}
