'use client'

import { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import { localText } from '@/lib/translations'
import WilayaSelect from '@/components/storefront/WilayaSelect'
import CommuneSelect from '@/components/storefront/CommuneSelect'

function isLightColor(color: string): boolean {
  const hex = color.replace('#', '')
  if (hex.length !== 6) return false
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5
}

interface LandingPageOrderFormProps {
  product: {
    _id: Id<'products'>
    name: string
    price: number
    salePrice?: number
    sizes: string[]
    colors: string[]
  }
  storefront: {
    slug: string
    sellerId: Id<'sellers'>
  }
  pageId: string
  design: {
    primaryColor: string
    accentColor: string
    backgroundColor: string
    textColor: string
  }
  ctaText: string
}

export default function LandingPageOrderForm({
  product,
  storefront,
  pageId,
  design,
  ctaText,
}: LandingPageOrderFormProps) {
  const { language } = useLanguage()
  const createOrder = useMutation(api.publicOrders.createPublicOrder)
  const incrementOrders = useMutation(api.landingPages.incrementOrderCount)

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [wilaya, setWilaya] = useState('')
  const [commune, setCommune] = useState('')
  const [deliveryType, setDeliveryType] = useState<'office' | 'home'>('office')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
  const [loadingFee, setLoadingFee] = useState(false)

  // Theme-aware colors
  const isLight = isLightColor(design.backgroundColor)
  const cardBg = isLight ? '#ffffff' : '#141414'
  const borderClr = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'
  const labelColor = isLight ? '#475569' : 'rgba(255,255,255,0.7)'
  const inputBg = isLight ? '#ffffff' : 'rgba(255,255,255,0.06)'
  const inputText = isLight ? '#1e293b' : '#f5f5dc'
  const inputBorder = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.12)'
  const summaryBg = isLight ? '#f8fafc' : 'rgba(255,255,255,0.04)'
  const mutedText = isLight ? '#64748b' : 'rgba(255,255,255,0.5)'
  const unselectedBg = isLight ? 'transparent' : 'transparent'
  const unselectedBorder = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.15)'
  const unselectedText = isLight ? '#475569' : 'rgba(255,255,255,0.7)'

  // Fetch delivery fee when wilaya/type changes
  useEffect(() => {
    if (!wilaya) { setDeliveryFee(null); return; }
    setLoadingFee(true)
    fetch(`/api/delivery/fees?wilaya=${encodeURIComponent(wilaya)}&type=${deliveryType}`)
      .then(r => r.json())
      .then(d => { setDeliveryFee(d.fee ?? null); setLoadingFee(false) })
      .catch(() => { setDeliveryFee(null); setLoadingFee(false) })
  }, [wilaya, deliveryType])

  const displayPrice = product.salePrice ?? product.price
  const subtotal = displayPrice * quantity
  const total = subtotal + (deliveryFee || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')

    try {
      const result = await createOrder({
        storefrontSlug: storefront.slug,
        items: [{
          productId: product._id,
          quantity,
          selectedSize: selectedSize || undefined,
          selectedColor: selectedColor || undefined,
        }],
        customerName,
        customerPhone,
        wilaya,
        commune: commune || undefined,
        deliveryType,
        deliveryAddress,
        deliveryFee: deliveryFee ?? undefined,
        source: "landing_page" as const,
      })

      await incrementOrders({ pageId })

      const orderId = (result as any).orderIds?.[0]
      window.location.href = `/${storefront.slug}/lp/${pageId}/success${orderId ? `?orderId=${orderId}` : ''}`
    } catch (err: any) {
      setError(err.message || 'Failed to submit order')
      setSubmitting(false)
    }
  }

  const t = {
    title: localText(language, { ar: 'اطلب الآن', en: 'Order Now', fr: 'Commander' }),
    name: localText(language, { ar: 'الاسم الكامل', en: 'Full Name', fr: 'Nom Complet' }),
    phone: localText(language, { ar: 'رقم الهاتف', en: 'Phone Number', fr: 'Telephone' }),
    wilaya: localText(language, { ar: 'الولاية', en: 'Wilaya', fr: 'Wilaya' }),
    commune: localText(language, { ar: 'البلدية', en: 'Commune', fr: 'Commune' }),
    address: localText(language, { ar: 'العنوان', en: 'Address', fr: 'Adresse' }),
    deliveryType: localText(language, { ar: 'نوع التوصيل', en: 'Delivery Type', fr: 'Type de Livraison' }),
    office: localText(language, { ar: 'مكتب', en: 'Office', fr: 'Bureau' }),
    home: localText(language, { ar: 'للمنزل', en: 'Home', fr: 'Domicile' }),
    qty: localText(language, { ar: 'الكمية', en: 'Quantity', fr: 'Quantite' }),
    size: localText(language, { ar: 'المقاس', en: 'Size', fr: 'Taille' }),
    color: localText(language, { ar: 'اللون', en: 'Color', fr: 'Couleur' }),
    submit: localText(language, { ar: 'تأكيد الطلب', en: 'Confirm Order', fr: 'Confirmer' }),
    submitting: localText(language, { ar: 'جاري الإرسال...', en: 'Submitting...', fr: 'Envoi...' }),
    subtotal: localText(language, { ar: 'المجموع', en: 'Subtotal', fr: 'Sous-total' }),
    delivery: localText(language, { ar: 'التوصيل', en: 'Delivery', fr: 'Livraison' }),
    total: localText(language, { ar: 'الإجمالي', en: 'Total', fr: 'Total' }),
    cod: localText(language, { ar: 'الدفع عند الاستلام', en: 'Cash on Delivery', fr: 'Paiement a la livraison' }),
  }

  const inputStyle = {
    backgroundColor: inputBg,
    borderColor: inputBorder,
    color: inputText,
  }

  return (
    <div
      id="order-form"
      className="rounded-2xl p-6 sm:p-8"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${borderClr}`,
        boxShadow: isLight ? '0 10px 40px rgba(0,0,0,0.08)' : '0 10px 40px rgba(0,0,0,0.3)',
      }}
    >
      <h3
        className="text-xl font-bold mb-6"
        style={{ color: isLight ? design.primaryColor : design.textColor, fontFamily: 'var(--font-outfit)' }}
      >
        {t.title}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Size selector */}
        {product.sizes.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>{t.size}</label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className="px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
                  style={selectedSize === size
                    ? { backgroundColor: design.accentColor, borderColor: design.accentColor, color: '#ffffff' }
                    : { borderColor: unselectedBorder, color: unselectedText, backgroundColor: unselectedBg }
                  }
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color selector */}
        {product.colors.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>{t.color}</label>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className="px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
                  style={selectedColor === color
                    ? { backgroundColor: design.accentColor, borderColor: design.accentColor, color: '#ffffff' }
                    : { borderColor: unselectedBorder, color: unselectedText, backgroundColor: unselectedBg }
                  }
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>{t.qty}</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-lg border flex items-center justify-center text-lg font-bold transition-colors"
              style={{ borderColor: unselectedBorder, color: unselectedText }}
            >
              -
            </button>
            <span className="text-lg font-bold w-8 text-center" style={{ color: design.textColor }}>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-lg border flex items-center justify-center text-lg font-bold transition-colors"
              style={{ borderColor: unselectedBorder, color: unselectedText }}
            >
              +
            </button>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>{t.name}</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
            style={{ ...inputStyle, '--tw-ring-color': design.accentColor } as any}
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>{t.phone}</label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="0551234567"
            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
            style={{ ...inputStyle, '--tw-ring-color': design.accentColor } as any}
            required
          />
        </div>

        {/* Wilaya */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>{t.wilaya}</label>
          <WilayaSelect
            value={wilaya}
            onChange={(val) => { setWilaya(val); setCommune(''); }}
          />
        </div>

        {/* Delivery type */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>{t.deliveryType}</label>
          <div className="flex gap-3">
            {(['office', 'home'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setDeliveryType(type)}
                className="flex-1 py-3 rounded-xl border text-sm font-medium transition-colors"
                style={deliveryType === type
                  ? { backgroundColor: design.accentColor, borderColor: design.accentColor, color: '#ffffff' }
                  : { borderColor: unselectedBorder, color: unselectedText }
                }
              >
                {type === 'office' ? t.office : t.home}
              </button>
            ))}
          </div>
        </div>

        {/* Commune */}
        {wilaya && (
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>{t.commune}</label>
            <CommuneSelect
              wilayaName={wilaya}
              value={commune}
              onChange={setCommune}
            />
          </div>
        )}

        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>{t.address}</label>
          <input
            type="text"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
            style={{ ...inputStyle, '--tw-ring-color': design.accentColor } as any}
            required
          />
        </div>

        {/* Price summary */}
        <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: summaryBg }}>
          <div className="flex justify-between text-sm" style={{ color: mutedText }}>
            <span>{t.subtotal}</span>
            <span>{subtotal.toLocaleString()} DZD</span>
          </div>
          {deliveryFee !== null && (
            <div className="flex justify-between text-sm" style={{ color: mutedText }}>
              <span>{t.delivery}</span>
              <span>{loadingFee ? '...' : `${deliveryFee.toLocaleString()} DZD`}</span>
            </div>
          )}
          <div
            className="flex justify-between font-bold text-lg pt-2"
            style={{ color: isLight ? design.primaryColor : design.textColor, borderTop: `1px solid ${borderClr}` }}
          >
            <span>{t.total}</span>
            <span>{total.toLocaleString()} DZD</span>
          </div>
        </div>

        {/* COD badge */}
        <div className="text-center text-sm font-medium" style={{ color: mutedText }}>
          {t.cod}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl text-white font-bold text-lg tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          style={{ backgroundColor: design.accentColor, boxShadow: `0 8px 30px ${design.accentColor}40` }}
        >
          {submitting ? t.submitting : (ctaText || t.submit)}
        </button>
      </form>
    </div>
  )
}
