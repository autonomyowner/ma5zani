'use client'

import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Product } from '@/lib/mock-data'

interface ProductsListProps {
  products: Product[]
}

export default function ProductsList({ products }: ProductsListProps) {
  const getStatusVariant = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'low_stock':
        return 'warning'
      case 'out_of_stock':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatStatus = (status: Product['status']) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2
          className="text-lg font-bold text-[#0054A6]"
          style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
        >
          Products Inventory
        </h2>
        <a href="/dashboard/products" className="text-sm text-[#0054A6] hover:text-[#00AEEF] font-medium">
          Manage Products
        </a>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-4">
          {products.slice(0, 6).map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900 truncate">{product.name}</h3>
                <p className="text-sm text-slate-500">SKU: {product.sku}</p>
              </div>

              <div className="flex items-center gap-4 ml-4">
                <div className="text-right">
                  <p
                    className="font-bold text-slate-900"
                    style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                  >
                    {product.stock}
                  </p>
                  <p className="text-xs text-slate-500">in stock</p>
                </div>
                <Badge variant={getStatusVariant(product.status)}>
                  {formatStatus(product.status)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
