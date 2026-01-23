'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { Doc, Id } from '@/convex/_generated/dataModel'
import Sidebar from '@/components/dashboard/Sidebar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export default function OrdersPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const orders = useQuery(api.orders.getOrders, {})
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus)

  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

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

  const handleStatusChange = async (orderId: Id<'orders'>, newStatus: OrderStatus) => {
    setUpdatingOrder(orderId)
    try {
      await updateOrderStatus({ orderId, status: newStatus })
    } catch (error) {
      console.error('Failed to update order:', error)
    }
    setUpdatingOrder(null)
  }

  const statusOptions: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar seller={seller} />

      <main className="ml-64 min-h-screen">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
              Orders
            </h1>
            <p className="text-slate-500 text-sm">Manage and track your orders</p>
          </div>
        </header>

        <div className="p-8">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-600 mr-2">Filter:</span>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-[#0054A6] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({orders?.length || 0})
              </button>
              {statusOptions.map(status => {
                const count = orders?.filter(o => o.status === status).length || 0
                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                      filterStatus === status
                        ? 'bg-[#0054A6] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-500 mb-4">No orders found</p>
                {orders?.length === 0 && (
                  <p className="text-sm text-slate-400">Orders will appear here when customers place them</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Order #</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Wilaya</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
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
                            {order.amount.toLocaleString()} DZD
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusVariant(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                            disabled={updatingOrder === order._id}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#00AEEF] disabled:opacity-50"
                          >
                            {statusOptions.map(status => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
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
