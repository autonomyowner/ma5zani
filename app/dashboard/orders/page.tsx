'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Badge from '@/components/ui/Badge'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export default function OrdersPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { t } = useLanguage()
  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const orders = useQuery(api.orders.getOrders, {})
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus)

  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

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

  const filteredOrders = orders?.filter(order =>
    filterStatus === 'all' || order.status === filterStatus
  ) || []

  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case 'delivered': return 'success'
      case 'shipped': return 'info'
      case 'processing': return 'warning'
      case 'pending': return 'default'
      case 'cancelled': return 'error'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<string, string> = {
      pending: t.dashboard.pending,
      processing: t.dashboard.processing,
      shipped: t.dashboard.shipped,
      delivered: t.dashboard.delivered,
      cancelled: t.dashboard.cancelled,
    }
    return labels[status] || status
  }

  const handleStatusChange = async (orderId: Id<'orders'>, newStatus: 'pending' | 'processing') => {
    setUpdatingOrder(orderId)
    try {
      await updateOrderStatus({ orderId, status: newStatus })
    } catch (error) {
      console.error('Failed to update order:', error)
    }
    setUpdatingOrder(null)
  }

  const statusOptions: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

  // Seller can only set pending or processing (send order). Other statuses are admin-controlled.
  const isSellerActionable = (status: OrderStatus) => status === 'pending' || status === 'processing'

  return (
    <DashboardLayout
      seller={seller}
      title={t.dashboard.orders}
      subtitle={t.dashboard.manageOrders}
    >
      <div className="space-y-4 lg:space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 lg:p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs lg:text-sm font-medium text-slate-600 mr-1 lg:mr-2">{t.dashboard.filter}:</span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-[#0054A6] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.dashboard.all} ({orders?.length || 0})
            </button>
            {statusOptions.map(status => {
              const count = orders?.filter(o => o.status === status).length || 0
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-2 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-[#0054A6] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {getStatusLabel(status)} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Orders Table - Desktop */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hidden lg:block">
          {filteredOrders.length === 0 ? (
            <div className="p-8 lg:p-12 text-center">
              <p className="text-slate-500 mb-4">{t.dashboard.noOrders}</p>
              {orders?.length === 0 && (
                <p className="text-sm text-slate-400">{t.dashboard.createFirstOrder}</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t.dashboard.orderId}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t.dashboard.customer}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t.dashboard.wilaya}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t.dashboard.product}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t.dashboard.qty}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t.dashboard.amount}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t.dashboard.status}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t.dashboard.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-[#0054A6]">{order.orderNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-slate-900">{order.customerName}</p>
                          {order.customerPhone && (
                            <p className="text-sm text-slate-500">{order.customerPhone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{order.wilaya}</td>
                      <td className="px-6 py-4 text-slate-600">{order.productName}</td>
                      <td className="px-6 py-4 text-slate-600">{order.quantity}</td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">
                          {order.amount.toLocaleString()} {t.dashboard.dzd}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {isSellerActionable(order.status) ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStatusChange(order._id, 'pending')}
                              disabled={updatingOrder === order._id || order.status === 'pending'}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                                order.status === 'pending'
                                  ? 'bg-slate-200 text-slate-600 cursor-default'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {t.dashboard.pending}
                            </button>
                            <button
                              onClick={() => handleStatusChange(order._id, 'processing')}
                              disabled={updatingOrder === order._id || order.status === 'processing'}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                                order.status === 'processing'
                                  ? 'bg-[#0054A6]/20 text-[#0054A6] cursor-default'
                                  : 'bg-[#0054A6] text-white hover:bg-[#004690]'
                              }`}
                            >
                              {t.dashboard.sendOrder}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Orders Cards - Mobile */}
        <div className="lg:hidden space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <p className="text-slate-500 mb-4">{t.dashboard.noOrders}</p>
              {orders?.length === 0 && (
                <p className="text-sm text-slate-400">{t.dashboard.createFirstOrder}</p>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-bold text-[#0054A6]">{order.orderNumber}</span>
                    <p className="text-sm text-slate-900 mt-1">{order.customerName}</p>
                    {order.customerPhone && (
                      <p className="text-xs text-slate-500">{order.customerPhone}</p>
                    )}
                  </div>
                  <Badge variant={getStatusVariant(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-slate-500">{t.dashboard.wilaya}:</span>
                    <span className="ml-1 text-slate-900">{order.wilaya}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t.dashboard.qty}:</span>
                    <span className="ml-1 text-slate-900">{order.quantity}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">{t.dashboard.product}:</span>
                    <span className="ml-1 text-slate-900">{order.productName}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="font-bold text-slate-900">
                    {order.amount.toLocaleString()} {t.dashboard.dzd}
                  </span>
                  {isSellerActionable(order.status) ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusChange(order._id, 'pending')}
                        disabled={updatingOrder === order._id || order.status === 'pending'}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          order.status === 'pending'
                            ? 'bg-slate-200 text-slate-600 cursor-default'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t.dashboard.pending}
                      </button>
                      <button
                        onClick={() => handleStatusChange(order._id, 'processing')}
                        disabled={updatingOrder === order._id || order.status === 'processing'}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          order.status === 'processing'
                            ? 'bg-[#0054A6]/20 text-[#0054A6] cursor-default'
                            : 'bg-[#0054A6] text-white hover:bg-[#004690]'
                        }`}
                      >
                        {t.dashboard.sendOrder}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
