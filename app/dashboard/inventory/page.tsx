'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import Sidebar from '@/components/dashboard/Sidebar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function InventoryPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const products = useQuery(api.products.getProducts)
  const updateStock = useMutation(api.products.updateStock)

  const [updatingProduct, setUpdatingProduct] = useState<string | null>(null)
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({})

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

  const handleStockUpdate = async (productId: Id<'products'>, newStock: number) => {
    if (newStock < 0) return
    setUpdatingProduct(productId)
    try {
      await updateStock({ productId, stock: newStock })
      setStockInputs(prev => ({ ...prev, [productId]: '' }))
    } catch (error) {
      console.error('Failed to update stock:', error)
    }
    setUpdatingProduct(null)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'low_stock': return 'warning'
      case 'out_of_stock': return 'error'
      default: return 'default'
    }
  }

  const lowStockProducts = products?.filter(p => p.status === 'low_stock') || []
  const outOfStockProducts = products?.filter(p => p.status === 'out_of_stock') || []
  const totalStock = products?.reduce((sum, p) => sum + p.stock, 0) || 0

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar seller={seller} />

      <main className="ml-64 min-h-screen">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center px-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
              Inventory
            </h1>
            <p className="text-slate-500 text-sm">Track and manage stock levels</p>
          </div>
        </header>

        <div className="p-8">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <p className="text-sm text-slate-500 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
                {products?.length || 0}
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-slate-500 mb-1">Total Stock</p>
              <p className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-outfit)' }}>
                {totalStock.toLocaleString()}
              </p>
            </Card>
            <Card className="p-6 border-l-4 border-l-[#F7941D]">
              <p className="text-sm text-slate-500 mb-1">Low Stock</p>
              <p className="text-3xl font-bold text-[#F7941D]" style={{ fontFamily: 'var(--font-outfit)' }}>
                {lowStockProducts.length}
              </p>
            </Card>
            <Card className="p-6 border-l-4 border-l-red-500">
              <p className="text-sm text-slate-500 mb-1">Out of Stock</p>
              <p className="text-3xl font-bold text-red-500" style={{ fontFamily: 'var(--font-outfit)' }}>
                {outOfStockProducts.length}
              </p>
            </Card>
          </div>

          {/* Alerts */}
          {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
            <div className="mb-8 space-y-4">
              {outOfStockProducts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="font-medium text-red-800">
                    {outOfStockProducts.length} product(s) out of stock
                  </p>
                  <p className="text-sm text-red-600">
                    {outOfStockProducts.map(p => p.name).join(', ')}
                  </p>
                </div>
              )}
              {lowStockProducts.length > 0 && (
                <div className="bg-[#F7941D]/10 border border-[#F7941D]/30 rounded-xl p-4">
                  <p className="font-medium text-[#D35400]">
                    {lowStockProducts.length} product(s) running low
                  </p>
                  <p className="text-sm text-[#D35400]/80">
                    {lowStockProducts.map(p => `${p.name} (${p.stock})`).join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Inventory Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
                Stock Levels
              </h2>
            </div>

            {products?.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-500">No products in inventory</p>
                <Button variant="primary" className="mt-4" onClick={() => router.push('/dashboard/products')}>
                  Add Products
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Current Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Update Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products?.map((product) => (
                      <tr key={product._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900">{product.name}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{product.sku}</td>
                        <td className="px-6 py-4">
                          <span className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-outfit)' }}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusVariant(product.status)}>
                            {product.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStockUpdate(product._id, product.stock - 1)}
                              disabled={product.stock === 0 || updatingProduct === product._id}
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              className="w-20 px-2 py-1 text-center border border-slate-200 rounded-lg focus:outline-none focus:border-[#00AEEF]"
                              value={stockInputs[product._id] ?? product.stock}
                              onChange={(e) => setStockInputs(prev => ({ ...prev, [product._id]: e.target.value }))}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value)
                                if (!isNaN(val) && val !== product.stock) {
                                  handleStockUpdate(product._id, val)
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = parseInt(stockInputs[product._id])
                                  if (!isNaN(val)) {
                                    handleStockUpdate(product._id, val)
                                  }
                                }
                              }}
                            />
                            <button
                              onClick={() => handleStockUpdate(product._id, product.stock + 1)}
                              disabled={updatingProduct === product._id}
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 font-bold"
                            >
                              +
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
        </div>
      </main>
    </div>
  )
}
