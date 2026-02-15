'use client'

import Badge from '@/components/ui/Badge'
import { Doc } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'

type Product = Doc<'products'>

interface ProductsListProps {
  products: Product[]
}

export default function ProductsList({ products }: ProductsListProps) {
  const { t } = useLanguage()

  const getStatusVariant = (status: Product['status']) => {
    switch (status) {
      case 'active': return 'success'
      case 'low_stock': return 'warning'
      case 'out_of_stock': return 'error'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: Product['status']) => {
    const labels: Record<string, string> = {
      active: t.dashboard.active,
      low_stock: t.dashboard.lowStock,
      out_of_stock: t.dashboard.outOfStock,
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
          {t.dashboard.products}
        </h2>
        <a href="/dashboard/products" className="text-sm text-[#0054A6] hover:text-[#00AEEF] font-medium">
          {t.dashboard.manageProducts}
        </a>
      </div>

      {products.length === 0 ? (
        <div className="p-6 sm:p-8 text-center text-slate-500">
          {t.dashboard.noProducts}. {t.dashboard.addFirstProduct}
        </div>
      ) : (
        <div className="p-3 sm:p-6">
          <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
            {products.slice(0, 6).map((product) => (
              <div
                key={product._id}
                className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 text-sm sm:text-base truncate">{product.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-500">{t.dashboard.sku}: {product.sku}</p>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 ml-3 sm:ml-4">
                  <div className="text-right">
                    <p
                      className="font-bold text-slate-900 text-sm sm:text-base"
                      style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                    >
                      {product.stock}
                    </p>
                    <p className="text-xs text-slate-500">{t.dashboard.inStock}</p>
                  </div>
                  <Badge variant={getStatusVariant(product.status)}>
                    {getStatusLabel(product.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
