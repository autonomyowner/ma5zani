'use client'

import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import { getR2PublicUrl } from '@/lib/r2'

interface DeliveryOptions {
  deliveryTo58: boolean
  freeDelivery: boolean
  returnsAccepted: boolean
}

interface ProductPickerModalProps {
  sellerId: string
  onSelect: (product: Doc<'products'>, description: string, deliveryOptions: DeliveryOptions, ctaText: string) => void
  onClose: () => void
}

export default function ProductPickerModal({ sellerId, onSelect, onClose }: ProductPickerModalProps) {
  const { language, t } = useLanguage()
  const lp = t.landingPages
  const isRTL = language === 'ar'

  const [selectedProduct, setSelectedProduct] = useState<Doc<'products'> | null>(null)
  const [description, setDescription] = useState('')
  const [ctaText, setCtaText] = useState(
    language === 'ar' ? 'اطلب الآن' : language === 'fr' ? 'Commander' : 'Order Now'
  )
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOptions>({
    deliveryTo58: true,
    freeDelivery: false,
    returnsAccepted: false,
  })

  const products = useQuery(api.products.getProductsBySeller, {
    sellerId: sellerId as any,
  })

  const descPlaceholder = language === 'ar'
    ? 'وصف المنتج: مثلا "تيشرت رياضي قطن 100% مريح بزاف للصيف"'
    : language === 'fr'
    ? 'Decrivez le produit: ex "T-shirt sport 100% coton tres confortable"'
    : 'Describe the product: e.g. "Sport t-shirt 100% cotton very comfortable"'

  const descLabel = language === 'ar'
    ? 'وصف المنتج'
    : language === 'fr'
    ? 'Description du produit'
    : 'Product description'

  const ctaLabel = language === 'ar' ? 'نص زر الطلب' : language === 'fr' ? 'Texte du bouton' : 'CTA button text'

  const deliveryLabel = language === 'ar' ? 'توصيل لكل 58 ولاية' : language === 'fr' ? 'Livraison dans les 58 wilayas' : 'Delivery to 58 wilayas'
  const freeDeliveryLabel = language === 'ar' ? 'توصيل مجاني' : language === 'fr' ? 'Livraison gratuite' : 'Free delivery'
  const returnsLabel = language === 'ar' ? 'إرجاع مقبول' : language === 'fr' ? 'Retours acceptes' : 'Returns accepted'

  const confirmLabel = language === 'ar' ? 'إنشاء الصفحة' : language === 'fr' ? 'Creer la page' : 'Create Page'
  const backLabel = language === 'ar' ? 'رجوع' : language === 'fr' ? 'Retour' : 'Back'

  // Pre-fill description when product is selected
  const handleSelectProduct = (product: Doc<'products'>) => {
    setSelectedProduct(product)
    setDescription((product as any).description || '')
  }

  // Step 2: Details input after picking product
  if (selectedProduct) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header with selected product */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                {selectedProduct.imageKeys?.[0] ? (
                  <img
                    src={getR2PublicUrl(selectedProduct.imageKeys[0])}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">--</div>
                )}
              </div>
              <div>
                <p className="font-bold text-slate-900">{selectedProduct.name}</p>
                <p className="text-sm text-slate-500">
                  {(selectedProduct.salePrice || selectedProduct.price).toLocaleString()} DZD
                </p>
              </div>
            </div>

            {/* Description */}
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {descLabel}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={descPlaceholder}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0054A6]/30 resize-none"
              dir={isRTL ? 'rtl' : 'ltr'}
            />

            {/* CTA text */}
            <label className="block text-sm font-medium text-slate-700 mb-2 mt-4">
              {ctaLabel}
            </label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0054A6]/30"
              dir={isRTL ? 'rtl' : 'ltr'}
            />

            {/* Delivery toggles */}
            <div className="mt-5 space-y-3">
              {([
                { key: 'deliveryTo58' as const, label: deliveryLabel },
                { key: 'freeDelivery' as const, label: freeDeliveryLabel },
                { key: 'returnsAccepted' as const, label: returnsLabel },
              ]).map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-slate-700">{label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={deliveryOptions[key]}
                    onClick={() => setDeliveryOptions(prev => ({ ...prev, [key]: !prev[key] }))}
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{ backgroundColor: deliveryOptions[key] ? '#0054A6' : '#cbd5e1' }}
                  >
                    <span
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                      style={{ transform: deliveryOptions[key] ? (isRTL ? 'translateX(-1.25rem)' : 'translateX(1.25rem)') : 'translateX(0.125rem)' }}
                    />
                  </button>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 flex gap-3">
            <button
              onClick={() => setSelectedProduct(null)}
              className="flex-1 py-2.5 text-slate-600 hover:text-slate-900 font-medium border border-slate-200 rounded-xl transition-colors"
            >
              {backLabel}
            </button>
            <button
              onClick={() => onSelect(selectedProduct, description, deliveryOptions, ctaText)}
              className="flex-1 py-2.5 bg-[#0054A6] text-white rounded-xl font-medium hover:bg-[#004590] transition-colors"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 1: Pick product
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-outfit)' }}>
            {lp?.pickProduct || 'Pick a Product'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{lp?.pickProductDesc || 'Choose a product to create a landing page for'}</p>
        </div>

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
                    onClick={() => handleSelectProduct(product)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
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
                    <span className="text-slate-400 text-lg">&rarr;</span>
                  </button>
                ))}
            </div>
          )}
        </div>

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
