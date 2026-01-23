'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import Sidebar from '@/components/dashboard/Sidebar'
import Card from '@/components/ui/Card'

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const stats = useQuery(api.stats.getDashboardStats)
  const orders = useQuery(api.orders.getOrders, {})
  const products = useQuery(api.products.getProducts)

  if (!isLoaded || seller === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    )
  }

  if (seller === null && user) {
    router.push('/onboarding')
    return null
  }

  // Calculate analytics
  const totalOrders = orders?.length || 0
  const deliveredOrders = orders?.filter(o => o.status === 'delivered').length || 0
  const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0
  const deliveryRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : '0'
  const cancelRate = totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : '0'

  const totalRevenue = orders?.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.amount, 0) || 0
  const avgOrderValue = deliveredOrders > 0 ? Math.round(totalRevenue / deliveredOrders) : 0

  // Orders by wilaya
  const ordersByWilaya = orders?.reduce((acc, order) => {
    acc[order.wilaya] = (acc[order.wilaya] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const topWilayas = Object.entries(ordersByWilaya)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Top products by orders
  const ordersByProduct = orders?.reduce((acc, order) => {
    acc[order.productName] = (acc[order.productName] || 0) + order.quantity
    return acc
  }, {} as Record<string, number>) || {}

  const topProducts = Object.entries(ordersByProduct)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Orders by status
  const ordersByStatus = {
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    processing: orders?.filter(o => o.status === 'processing').length || 0,
    shipped: orders?.filter(o => o.status === 'shipped').length || 0,
    delivered: deliveredOrders,
    cancelled: cancelledOrders,
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar seller={seller} />

      <main className="ml-64 min-h-screen">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center px-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
              Analytics
            </h1>
            <p className="text-slate-500 text-sm">Track your business performance</p>
          </div>
        </header>

        <div className="p-8">
          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-[#22B14C]" style={{ fontFamily: 'var(--font-outfit)' }}>
                {totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-slate-500">DZD</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-slate-500 mb-1">Avg Order Value</p>
              <p className="text-3xl font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
                {avgOrderValue.toLocaleString()}
              </p>
              <p className="text-sm text-slate-500">DZD</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-slate-500 mb-1">Delivery Rate</p>
              <p className="text-3xl font-bold text-[#22B14C]" style={{ fontFamily: 'var(--font-outfit)' }}>
                {deliveryRate}%
              </p>
              <p className="text-sm text-slate-500">{deliveredOrders} of {totalOrders} orders</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-slate-500 mb-1">Cancel Rate</p>
              <p className="text-3xl font-bold text-red-500" style={{ fontFamily: 'var(--font-outfit)' }}>
                {cancelRate}%
              </p>
              <p className="text-sm text-slate-500">{cancelledOrders} cancelled</p>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Status Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-[#0054A6] mb-4" style={{ fontFamily: 'var(--font-outfit)' }}>
                Orders by Status
              </h3>
              {totalOrders === 0 ? (
                <p className="text-slate-500 text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(ordersByStatus).map(([status, count]) => {
                    const percentage = ((count / totalOrders) * 100).toFixed(0)
                    const colors: Record<string, string> = {
                      pending: 'bg-slate-400',
                      processing: 'bg-[#F7941D]',
                      shipped: 'bg-[#00AEEF]',
                      delivered: 'bg-[#22B14C]',
                      cancelled: 'bg-red-500',
                    }
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize text-slate-600">{status}</span>
                          <span className="font-medium">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors[status]} transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* Top Products */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-[#0054A6] mb-4" style={{ fontFamily: 'var(--font-outfit)' }}>
                Top Products
              </h3>
              {topProducts.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No sales data yet</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map(([name, quantity], index) => (
                    <div key={name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#0054A6] text-white text-xs flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-slate-900">{name}</span>
                      </div>
                      <span className="text-[#0054A6] font-bold">{quantity} sold</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Top Wilayas */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-[#0054A6] mb-4" style={{ fontFamily: 'var(--font-outfit)' }}>
                Top Wilayas
              </h3>
              {topWilayas.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No order data yet</p>
              ) : (
                <div className="space-y-3">
                  {topWilayas.map(([wilaya, count], index) => (
                    <div key={wilaya} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#F7941D] text-white text-xs flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-slate-900">{wilaya}</span>
                      </div>
                      <span className="text-[#0054A6] font-bold">{count} orders</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-[#0054A6] mb-4" style={{ fontFamily: 'var(--font-outfit)' }}>
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600">Orders Today</span>
                  <span className="text-xl font-bold text-[#0054A6]">{stats?.ordersToday || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600">Pending Orders</span>
                  <span className="text-xl font-bold text-[#F7941D]">{stats?.pendingOrders || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600">Monthly Revenue</span>
                  <span className="text-xl font-bold text-[#22B14C]">{(stats?.monthlyRevenue || 0).toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600">Total Products</span>
                  <span className="text-xl font-bold text-slate-900">{products?.length || 0}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
