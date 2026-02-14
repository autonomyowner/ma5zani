'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import { getR2PublicUrl } from '@/lib/r2'

interface ProductPickerModalProps {
  sellerId: string
  onSelect: (product: Doc<'products'>) => void
  onClose: () => void
}

export default function ProductPickerModal({ sellerId, onSelect, onClose }: ProductPickerModalProps) {
  const { t } = useLanguage()
  const lp = t.landingPages

  const products = useQuery(api.products.getProductsBySeller, {
    sellerId: sellerId as any,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-outfit)' }}>
            {lp?.pickProduct || 'Pick a Product'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{lp?.pickProductDesc || 'Choose a product to create a landing page for'}</p>
        </div>

        {/* Product list */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {!products ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-slate-500 py-8">{lp?.noProducts || 'No products found.'}</p>
          ) : (
            <div className="space-y-2">
              {products
                .filter((p) => p.showOnStorefront && p.status !== 'out_of_stock')
                .map((product) => (
                  <button
                    key={product._id}
                    onClick={() => onSelect(product)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                      {product.imageKeys?.[0] ? (
                        <img
                          src={getR2PublicUrl(product.imageKeys[0])}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {product.salePrice ? (
                          <>
                            <span className="text-sm font-bold text-[#F7941D]">
                              {product.salePrice.toLocaleString()} DZD
                            </span>
                            <span className="text-xs text-slate-400 line-through">
                              {product.price.toLocaleString()} DZD
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-slate-700">
                            {product.price.toLocaleString()} DZD
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <span className="text-slate-400 text-lg">&rarr;</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
