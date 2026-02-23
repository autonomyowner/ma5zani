'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

export default function AdminProductsPage() {
  const router = useRouter()
  const [password, setPassword] = useState<string | null>(null)

  useEffect(() => {
    const savedPassword = sessionStorage.getItem('adminPassword')
    if (!savedPassword) {
      router.push('/admin')
    } else {
      setPassword(savedPassword)
    }
  }, [router])

  const products = useQuery(api.admin.getAllProducts, password ? { password } : 'skip')
  const sellers = useQuery(api.admin.getAllSellers, password ? { password } : 'skip')
  const deleteProduct = useMutation(api.admin.adminDeleteProduct)

  const handleDelete = async (productId: Id<'products'>, name: string) => {
    if (!password) return
    if (confirm(`Delete product "${name}"?`)) {
      try {
        await deleteProduct({ password, productId })
      } catch (error) {
        console.error('Failed to delete product:', error)
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'low_stock': return 'warning'
      case 'out_of_stock': return 'error'
      default: return 'default'
    }
  }

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
              <Link href="/admin/products" className="block px-4 py-3 rounded-xl bg-[#0054A6] text-white font-medium">
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
              All Products
            </h1>
            <p className="text-slate-300 text-sm">{products?.length || 0} total products</p>
          </div>
        </header>

        <div className="p-8">
          <div className="rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden">
            {products?.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                No products found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-700">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Seller</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {products?.map((product) => (
                      <tr key={product._id} className="hover:bg-slate-700/50">
                        <td className="px-6 py-4">
                          <span className="font-medium text-white">{product.name}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{getSellerName(product.sellerId)}</td>
                        <td className="px-6 py-4 text-slate-300">{product.sku}</td>
                        <td className="px-6 py-4 text-white font-medium">{product.price.toLocaleString()} DZD</td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${product.stock === 0 ? 'text-red-400' : product.stock <= 10 ? 'text-[#F7941D]' : 'text-white'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            product.status === 'active' ? 'bg-green-600 text-green-100' :
                            product.status === 'low_stock' ? 'bg-yellow-600 text-yellow-100' :
                            product.status === 'out_of_stock' ? 'bg-red-600 text-red-100' :
                            'bg-slate-600 text-slate-200'
                          }`}>
                            {product.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(product._id, product.name)}
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
