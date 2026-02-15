'use client'

import Badge from '@/components/ui/Badge'
import { Doc } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'

type Order = Doc<'orders'>

interface OrdersTableProps {
  orders: Order[]
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const { t } = useLanguage()

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'success'
      case 'shipped': return 'info'
      case 'processing': return 'warning'
      case 'pending': return 'default'
      case 'cancelled': return 'error'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: Order['status']) => {
    const labels: Record<string, string> = {
      pending: t.dashboard.pending,
      processing: t.dashboard.processing,
      shipped: t.dashboard.shipped,
      delivered: t.dashboard.delivered,
      cancelled: t.dashboard.cancelled,
    }
    return labels[status] || status
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
        <h2
          className="text-base sm:text-lg font-bold text-[#0054A6]"
          style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
        >
          {t.dashboard.recentOrders}
        </h2>
        <a href="/dashboard/orders" className="text-sm text-[#0054A6] hover:text-[#00AEEF] font-medium">
          {t.dashboard.viewAll}
        </a>
      </div>

      {orders.length === 0 ? (
        <div className="p-6 sm:p-8 text-center text-slate-500">
          {t.dashboard.noOrders}. {t.dashboard.createFirstOrder}
        </div>
      ) : (
        <>
          {/* Mobile card layout */}
          <div className="sm:hidden divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order._id} className="px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#0054A6] text-sm">{order.orderNumber}</span>
                  <Badge variant={getStatusVariant(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-900">{order.customerName}</span>
                  <span className="text-sm font-medium text-slate-900">
                    {order.amount.toLocaleString()} {t.dashboard.dzd}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{order.wilaya}{order.commune ? ` - ${order.commune}` : ''}</span>
                  <span className="truncate ml-2">{order.productName}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table layout */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t.dashboard.orderId}
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t.dashboard.customer}
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t.dashboard.wilaya}
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t.dashboard.product}
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t.dashboard.amount}
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t.dashboard.status}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <span className="font-medium text-[#0054A6]">{order.orderNumber}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-slate-900">{order.customerName}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-slate-600">
                      <span>{order.wilaya}</span>
                      {order.commune && (
                        <p className="text-xs text-slate-400">{order.commune}</p>
                      )}
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-slate-600">{order.productName}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <span className="font-medium text-slate-900">
                        {order.amount.toLocaleString()} {t.dashboard.dzd}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <Badge variant={getStatusVariant(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
