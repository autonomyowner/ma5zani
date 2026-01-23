'use client'

import Badge from '@/components/ui/Badge'
import { Doc } from '@/convex/_generated/dataModel'

type Order = Doc<'orders'>

interface OrdersTableProps {
  orders: Order[]
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'success'
      case 'shipped':
        return 'info'
      case 'processing':
        return 'warning'
      case 'pending':
        return 'default'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatStatus = (status: Order['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2
          className="text-lg font-bold text-[#0054A6]"
          style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
        >
          Recent Orders
        </h2>
        <a href="/dashboard/orders" className="text-sm text-[#0054A6] hover:text-[#00AEEF] font-medium">
          View All
        </a>
      </div>

      {orders.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          No orders yet. Create your first order to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Wilaya
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-[#0054A6]">{order.orderNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-900">{order.customerName}</td>
                  <td className="px-6 py-4 text-slate-600">{order.wilaya}</td>
                  <td className="px-6 py-4 text-slate-600">{order.productName}</td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">
                      {order.amount.toLocaleString()} DZD
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusVariant(order.status)}>
                      {formatStatus(order.status)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
