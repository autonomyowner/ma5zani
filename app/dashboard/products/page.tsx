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
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function ProductsPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
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
  })

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

  const resetForm = () => {
    setFormData({ name: '', sku: '', stock: '', price: '', description: '' })
    setEditingProduct(null)
    setShowAddModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingProduct) {
        await updateProduct({
          productId: editingProduct,
          name: formData.name,
          sku: formData.sku,
          stock: parseInt(formData.stock),
          price: parseFloat(formData.price),
          description: formData.description || undefined,
        })
      } else {
        await createProduct({
          name: formData.name,
          sku: formData.sku,
          stock: parseInt(formData.stock),
          price: parseFloat(formData.price),
          description: formData.description || undefined,
        })
      }
      resetForm()
    } catch (error) {
      console.error('Failed to save product:', error)
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar seller={seller} />

      <main className="ml-64 min-h-screen">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
              Products
            </h1>
            <p className="text-slate-500 text-sm">Manage your product catalog</p>
          </div>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            + Add Product
          </Button>
        </header>

        <div className="p-8">
          {/* Products Grid */}
          {products?.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-slate-500 mb-4">No products yet</p>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                Add Your First Product
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((product) => (
                <Card key={product._id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900" style={{ fontFamily: 'var(--font-outfit)' }}>
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-500">SKU: {product.sku}</p>
                    </div>
                    <Badge variant={getStatusVariant(product.status)}>
                      {product.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Badge>
                  </div>

                  {product.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{product.description}</p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
                        {product.price.toLocaleString()} <span className="text-sm font-normal text-slate-500">DZD</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{product.stock}</p>
                      <p className="text-xs text-slate-500">in stock</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleEdit(product)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(product._id)}>
                      Delete
                    </Button>
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
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    id="name"
                    label="Product Name"
                    placeholder="e.g., Wireless Earbuds"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    id="sku"
                    label="SKU"
                    placeholder="e.g., WE-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      id="stock"
                      type="number"
                      label="Stock Quantity"
                      placeholder="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                    />
                    <Input
                      id="price"
                      type="number"
                      label="Price (DZD)"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#00AEEF] focus:outline-none resize-none"
                      rows={3}
                      placeholder="Product description..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="ghost" className="flex-1" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
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
