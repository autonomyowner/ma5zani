'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export default function AdminOrdersPage() {
  const router = useRouter()
  const [password, setPassword] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')

  useEffect(() => {
    const savedPassword = sessionStorage.getItem('adminPassword')
    if (!savedPassword) {
      router.push('/admin')
    } else {
      setPassword(savedPassword)
    }
  }, [router])

  const orders = useQuery(api.admin.getAllOrders, password ? { password } : 'skip')
  const sellers = useQuery(api.admin.getAllSellers, password ? { password } : 'skip')
  const updateStatus = useMutation(api.admin.adminUpdateOrderStatus)
  const deleteOrder = useMutation(api.admin.deleteOrder)

  const handleStatusChange = async (orderId: Id<'orders'>, status: OrderStatus) => {
    if (!password) return
    setUpdatingId(orderId)
    try {
      await updateStatus({ password, orderId, status })
    } catch (error) {
      console.error('Failed to update status:', error)
    }
    setUpdatingId(null)
  }

  const handleDelete = async (orderId: Id<'orders'>, orderNumber: string) => {
    if (!password) return
    if (confirm(`Delete order "${orderNumber}"?`)) {
      try {
        await deleteOrder({ password, orderId })
      } catch (error) {
        console.error('Failed to delete order:', error)
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

  const getSellerName = (sellerId: Id<'sellers'>) => {
    return sellers?.find(s => s._id === sellerId)?.name || 'Unknown'
  }

  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case 'delivered': return 'success'
      case 'shipped': return 'info'
      case 'processing': return 'warning'
      case 'cancelled': return 'error'
      default: return 'default'
    }
  }

  const filteredOrders = orders?.filter(o => filterStatus === 'all' || o.status === filterStatus) || []
  const statusOptions: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

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
              <Link href="/admin/orders" className="block px-4 py-3 rounded-xl bg-[#0054A6] text-white font-medium">
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
              <Link href="/admin/referrals" className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 font-medium">
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
        <header className="h-20 bg-slate-800 border-b border-slate-700 flex items-center px-8">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit)' }}>
              All Orders
            </h1>
            <p className="text-slate-300 text-sm">{orders?.length || 0} total orders</p>
          </div>
        </header>

        <div className="p-8">
          {/* Filters */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-200 mr-2">Filter:</span>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'all' ? 'bg-[#0054A6] text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                      filterStatus === status ? 'bg-[#0054A6] text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {status} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                No orders found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-700">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Order #</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Seller</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Wilaya</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-700/50">
                        <td className="px-6 py-4">
                          <span className="font-medium text-[#00AEEF]">{order.orderNumber}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{getSellerName(order.sellerId)}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white">{order.customerName}</p>
                            <p className="text-sm text-slate-300">{order.productName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{order.wilaya}</td>
                        <td className="px-6 py-4 text-white font-medium">{order.amount.toLocaleString()} DZD</td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                            disabled={updatingId === order._id}
                            className="px-3 py-1.5 rounded-lg bg-slate-600 text-white border border-slate-500 focus:outline-none focus:border-[#00AEEF] disabled:opacity-50"
                          >
                            {statusOptions.map(status => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(order._id, order.orderNumber)}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
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
