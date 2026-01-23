'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import { getR2PublicUrl } from '@/lib/r2'
import Sidebar from '@/components/dashboard/Sidebar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import ImageUpload from '@/components/ui/ImageUpload'

export default function ProductsPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { t } = useLanguage()
  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const products = useQuery(api.products.getProducts)
  const createProduct = useMutation(api.products.createProduct)
  const updateProduct = useMutation(api.products.updateProduct)
  const deleteProduct = useMutation(api.products.deleteProduct)

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Id<'products'> | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    stock: '',
    price: '',
    description: '',
    imageKeys: [] as string[],
  })

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

  const resetForm = () => {
    setFormData({ name: '', sku: '', stock: '', price: '', description: '', imageKeys: [] })
    setEditingProduct(null)
    setShowAddModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name.trim() || !formData.sku.trim() || !formData.stock || !formData.price) {
      alert('Please fill in all required fields')
      return
    }

    const stockNum = parseInt(formData.stock)
    const priceNum = parseFloat(formData.price)

    if (isNaN(stockNum) || isNaN(priceNum)) {
      alert('Please enter valid numbers for stock and price')
      return
    }

    setIsSubmitting(true)

    try {
      if (editingProduct) {
        await updateProduct({
          productId: editingProduct,
          name: formData.name.trim(),
          sku: formData.sku.trim(),
          stock: stockNum,
          price: priceNum,
          description: formData.description?.trim() || undefined,
          imageKeys: formData.imageKeys.length > 0 ? formData.imageKeys : undefined,
        })
      } else {
        await createProduct({
          name: formData.name.trim(),
          sku: formData.sku.trim(),
          stock: stockNum,
          price: priceNum,
          description: formData.description?.trim() || undefined,
          imageKeys: formData.imageKeys.length > 0 ? formData.imageKeys : undefined,
        })
      }
      resetForm()
    } catch (error: any) {
      console.error('Failed to save product:', error)
      alert(error?.message || 'Failed to save product. Please try again.')
    }
    setIsSubmitting(false)
  }

  const handleEdit = (product: NonNullable<typeof products>[0]) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      stock: product.stock.toString(),
      price: product.price.toString(),
      description: product.description || '',
      imageKeys: product.imageKeys || [],
    })
    setEditingProduct(product._id)
    setShowAddModal(true)
  }

  const handleDelete = async (productId: Id<'products'>) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct({ productId })
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar seller={seller} />

      <main className="ml-64 min-h-screen">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
              {t.dashboard.products}
            </h1>
            <p className="text-slate-500 text-sm">{t.dashboard.manageProducts}</p>
          </div>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            {t.dashboard.addProduct}
          </Button>
        </header>

        <div className="p-8">
          {products?.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-slate-500 mb-4">{t.dashboard.noProducts}</p>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                {t.dashboard.addFirstProduct}
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((product) => (
                <Card key={product._id} className="overflow-hidden">
                  {/* Product Image */}
                  <div className="aspect-square bg-slate-100 relative">
                    {product.imageKeys && product.imageKeys.length > 0 ? (
                      <img
                        src={getR2PublicUrl(product.imageKeys[0])}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {product.imageKeys && product.imageKeys.length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        +{product.imageKeys.length - 1}
                      </span>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={getStatusVariant(product.status)}>
                        {getStatusLabel(product.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="font-bold text-slate-900 truncate" style={{ fontFamily: 'var(--font-outfit)' }}>
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-500">{t.dashboard.sku}: {product.sku}</p>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xl font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
                          {product.price.toLocaleString()} <span className="text-xs font-normal text-slate-500">{t.dashboard.dzd}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{product.stock}</p>
                        <p className="text-xs text-slate-500">{t.dashboard.inStock}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleEdit(product)}>
                        {t.dashboard.edit}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(product._id)}>
                        {t.dashboard.delete}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-[#0054A6] mb-6" style={{ fontFamily: 'var(--font-outfit)' }}>
                  {editingProduct ? t.dashboard.editProduct : t.dashboard.addNewProduct}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Product Images */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      {t.dashboard.productImages}
                    </label>
                    <ImageUpload
                      value={formData.imageKeys}
                      onChange={(keys) => setFormData({ ...formData, imageKeys: keys })}
                      maxImages={5}
                      folder="products"
                    />
                  </div>

                  <Input
                    id="name"
                    label={t.dashboard.productName}
                    placeholder="e.g., Wireless Earbuds"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    id="sku"
                    label={t.dashboard.sku}
                    placeholder="e.g., WE-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      id="stock"
                      type="number"
                      label={t.dashboard.stockQuantity}
                      placeholder="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                    />
                    <Input
                      id="price"
                      type="number"
                      label={`${t.dashboard.price} (${t.dashboard.dzd})`}
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      {t.dashboard.description} ({t.dashboard.optional})
                    </label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#00AEEF] focus:outline-none resize-none"
                      rows={3}
                      placeholder="..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="ghost" className="flex-1" onClick={resetForm}>
                      {t.dashboard.cancel}
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? t.dashboard.saving : editingProduct ? t.dashboard.update : t.dashboard.save}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
