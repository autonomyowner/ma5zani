'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import { useCurrentSeller } from '@/hooks/useCurrentSeller'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import YalidineOrderActions from '@/components/dashboard/YalidineOrderActions'
import Badge from '@/components/ui/Badge'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export default function OrdersPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { seller, isLoading, isAuthenticated } = useCurrentSeller()
  const orders = useQuery(api.orders.getOrders, {})
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus)
  const deleteOrder = useMutation(api.orders.deleteOrder)

  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isLoading, isAuthenticated])

  if (isLoading || seller === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">{t.dashboard.loading}</div>
      </div>
    )
  }

  if (seller === null && isAuthenticated) {
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

  const handleStatusChange = async (orderId: Id<'orders'>, newStatus: OrderStatus) => {
    setUpdatingOrder(orderId)
    try {
      await updateOrderStatus({ orderId, status: newStatus })
    } catch (error) {
      console.error('Failed to update order:', error)
    }
    setUpdatingOrder(null)
  }

  const handleDeleteOrder = async (orderId: Id<'orders'>) => {
    if (!window.confirm(t.dashboard.delete + '?')) return
    setDeletingOrder(orderId)
    try {
      await deleteOrder({ orderId })
    } catch (error) {
      console.error('Failed to delete order:', error)
    }
    setDeletingOrder(null)
  }

  const statusOptions: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t.dashboard.delivery}</th>
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
                      <td className="px-6 py-4 text-slate-600">
                        <div>
                          <span>{order.wilaya}</span>
                          {order.commune && (
                            <p className="text-xs text-slate-400">{order.commune}</p>
                          )}
                          {order.deliveryType && (
                            <p className="text-xs text-slate-400">
                              {order.deliveryType === 'home' ? t.dashboard.homeDelivery : t.dashboard.officeDelivery}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div>
                          <span>{order.productName}</span>
                          {(order.selectedSize || order.selectedColor) && (
                            <p className="text-xs text-slate-400">
                              {[order.selectedSize, order.selectedColor].filter(Boolean).join(' / ')}
                            </p>
                          )}
                        </div>
                      </td>
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
                        <YalidineOrderActions
                          orderId={order._id}
                          yalidineTracking={order.yalidineTracking}
                          yalidineStatus={order.yalidineStatus}
                          hasDeliverySettings={!!seller?.deliverySettings?.isEnabled}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                            disabled={updatingOrder === order._id}
                            className="px-2 py-1.5 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0054A6]/20 disabled:opacity-50"
                          >
                            {statusOptions.map(s => (
                              <option key={s} value={s}>{getStatusLabel(s)}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            disabled={deletingOrder === order._id}
                            className="px-2 py-1.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {t.dashboard.delete}
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
                    {order.commune && (
                      <span className="ml-1 text-xs text-slate-400">({order.commune})</span>
                    )}
                    {order.deliveryType && (
                      <span className="ml-1 text-xs text-slate-400">
                        - {order.deliveryType === 'home' ? t.dashboard.homeDelivery : t.dashboard.officeDelivery}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500">{t.dashboard.qty}:</span>
                    <span className="ml-1 text-slate-900">{order.quantity}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">{t.dashboard.product}:</span>
                    <span className="ml-1 text-slate-900">{order.productName}</span>
                    {(order.selectedSize || order.selectedColor) && (
                      <span className="ml-1 text-xs text-slate-400">
                        ({[order.selectedSize, order.selectedColor].filter(Boolean).join(' / ')})
                      </span>
                    )}
                  </div>
                </div>
                {/* Delivery Actions */}
                {seller?.deliverySettings?.isEnabled && (
                  <div className="mb-3">
                    <YalidineOrderActions
                      orderId={order._id}
                      yalidineTracking={order.yalidineTracking}
                      yalidineStatus={order.yalidineStatus}
                      hasDeliverySettings={!!seller?.deliverySettings?.isEnabled}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="font-bold text-slate-900">
                    {order.amount.toLocaleString()} {t.dashboard.dzd}
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                      disabled={updatingOrder === order._id}
                      className="px-2 py-1 rounded-lg text-xs border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0054A6]/20 disabled:opacity-50"
                    >
                      {statusOptions.map(s => (
                        <option key={s} value={s}>{getStatusLabel(s)}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      disabled={deletingOrder === order._id}
                      className="px-2 py-1 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {t.dashboard.delete}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
