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
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function InventoryPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { t } = useLanguage()
  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const products = useQuery(api.products.getProducts)
  const updateStock = useMutation(api.products.updateStock)

  const [updatingProduct, setUpdatingProduct] = useState<string | null>(null)
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({})

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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: t.dashboard.active,
      low_stock: t.dashboard.lowStock,
      out_of_stock: t.dashboard.outOfStock,
    }
    return labels[status] || status
  }

  const lowStockProducts = products?.filter(p => p.status === 'low_stock') || []
  const outOfStockProducts = products?.filter(p => p.status === 'out_of_stock') || []
  const totalStock = products?.reduce((sum, p) => sum + p.stock, 0) || 0

  return (
    <DashboardLayout
      seller={seller}
      title={t.dashboard.inventory}
      subtitle={t.dashboard.trackStock}
    >
      <div className="space-y-4 lg:space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          <Card className="p-4 lg:p-6">
            <p className="text-xs lg:text-sm text-slate-500 mb-1">{t.dashboard.totalProducts}</p>
            <p className="text-2xl lg:text-3xl font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
              {products?.length || 0}
            </p>
          </Card>
          <Card className="p-4 lg:p-6">
            <p className="text-xs lg:text-sm text-slate-500 mb-1">{t.dashboard.totalStock}</p>
            <p className="text-2xl lg:text-3xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-outfit)' }}>
              {totalStock.toLocaleString()}
            </p>
          </Card>
          <Card className="p-4 lg:p-6 border-l-4 border-l-[#F7941D]">
            <p className="text-xs lg:text-sm text-slate-500 mb-1">{t.dashboard.lowStock}</p>
            <p className="text-2xl lg:text-3xl font-bold text-[#F7941D]" style={{ fontFamily: 'var(--font-outfit)' }}>
              {lowStockProducts.length}
            </p>
          </Card>
          <Card className="p-4 lg:p-6 border-l-4 border-l-red-500">
            <p className="text-xs lg:text-sm text-slate-500 mb-1">{t.dashboard.outOfStock}</p>
            <p className="text-2xl lg:text-3xl font-bold text-red-500" style={{ fontFamily: 'var(--font-outfit)' }}>
              {outOfStockProducts.length}
            </p>
          </Card>
        </div>

        {/* Alerts */}
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <div className="space-y-3 lg:space-y-4">
            {outOfStockProducts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 lg:p-4">
                <p className="font-medium text-red-800 text-sm lg:text-base">
                  {outOfStockProducts.length} {t.dashboard.productsOutOfStock}
                </p>
                <p className="text-xs lg:text-sm text-red-600">
                  {outOfStockProducts.map(p => p.name).join(', ')}
                </p>
              </div>
            )}
            {lowStockProducts.length > 0 && (
              <div className="bg-[#F7941D]/10 border border-[#F7941D]/30 rounded-xl p-3 lg:p-4">
                <p className="font-medium text-[#D35400] text-sm lg:text-base">
                  {lowStockProducts.length} {t.dashboard.productsRunningLow}
                </p>
                <p className="text-xs lg:text-sm text-[#D35400]/80">
                  {lowStockProducts.map(p => `${p.name} (${p.stock})`).join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Inventory Table - Desktop */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hidden lg:block">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
              {t.dashboard.stockLevels}
            </h2>
          </div>

          {products?.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500">{t.dashboard.noProducts}</p>
              <Button variant="primary" className="mt-4" onClick={() => router.push('/dashboard/products')}>
                {t.dashboard.addProduct}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t.dashboard.product}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t.dashboard.sku}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t.dashboard.currentStock}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t.dashboard.status}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t.dashboard.updateStock}</th>
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
                          {getStatusLabel(product.status)}
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

        {/* Inventory Cards - Mobile */}
        <div className="lg:hidden space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <h2 className="text-base font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
              {t.dashboard.stockLevels}
            </h2>
          </div>
          {products?.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-slate-500">{t.dashboard.noProducts}</p>
              <Button variant="primary" className="mt-4" onClick={() => router.push('/dashboard/products')}>
                {t.dashboard.addProduct}
              </Button>
            </div>
          ) : (
            products?.map((product) => (
              <div key={product._id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-slate-900">{product.name}</h3>
                    <p className="text-xs text-slate-500">{t.dashboard.sku}: {product.sku}</p>
                  </div>
                  <Badge variant={getStatusVariant(product.status)}>
                    {getStatusLabel(product.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-outfit)' }}>
                    {product.stock}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStockUpdate(product._id, product.stock - 1)}
                      disabled={product.stock === 0 || updatingProduct === product._id}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 font-bold text-sm"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="w-16 px-2 py-1 text-center border border-slate-200 rounded-lg focus:outline-none focus:border-[#00AEEF] text-sm"
                      value={stockInputs[product._id] ?? product.stock}
                      onChange={(e) => setStockInputs(prev => ({ ...prev, [product._id]: e.target.value }))}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value)
                        if (!isNaN(val) && val !== product.stock) {
                          handleStockUpdate(product._id, val)
                        }
                      }}
                    />
                    <button
                      onClick={() => handleStockUpdate(product._id, product.stock + 1)}
                      disabled={updatingProduct === product._id}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 font-bold text-sm"
                    >
                      +
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
