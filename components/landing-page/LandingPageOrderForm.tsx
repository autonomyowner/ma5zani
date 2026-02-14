'use client'

import { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import { localText } from '@/lib/translations'
import WilayaSelect from '@/components/storefront/WilayaSelect'
import CommuneSelect from '@/components/storefront/CommuneSelect'

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

  // Fetch delivery fee when wilaya/type changes
  useEffect(() => {
    if (!wilaya) {
      setDeliveryFee(null)
      return
    }

    setLoadingFee(true)
    fetch(`/api/delivery/fees?wilaya=${encodeURIComponent(wilaya)}&deliveryType=${deliveryType}&sellerId=${storefront.sellerId}`)
      .then((res) => res.json())
      .then((data) => {
        setDeliveryFee(data.fee ?? null)
      })
      .catch(() => setDeliveryFee(null))
      .finally(() => setLoadingFee(false))
  }, [wilaya, deliveryType, storefront.sellerId])

  const unitPrice = product.salePrice ?? product.price
  const subtotal = unitPrice * quantity
  const total = subtotal + (deliveryFee || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!customerName.trim() || !customerPhone.trim() || !wilaya || !deliveryAddress.trim()) {
      setError(localText(language, {
        ar: 'يرجى ملء جميع الحقول المطلوبة',
        en: 'Please fill all required fields',
        fr: 'Veuillez remplir tous les champs requis',
      }))
      return
    }

    if (!/^0[567]\d{8}$/.test(customerPhone)) {
      setError(localText(language, {
        ar: 'رقم الهاتف غير صحيح (مثال: 0551234567)',
        en: 'Invalid phone number (e.g. 0551234567)',
        fr: 'Numero de telephone invalide (ex: 0551234567)',
      }))
      return
    }

    setSubmitting(true)
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

      // Increment LP order count
      await incrementOrders({ pageId })

      // Redirect to success
      const orderId = result.orderIds[0]
      window.location.href = `/${storefront.slug}/lp/${pageId}/success?orderId=${orderId}`
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
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    color: '#1a1a1a',
  }

  return (
    <div id="order-form" className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-200">
      <h3 className="text-xl font-bold mb-6" style={{ color: design.primaryColor, fontFamily: 'var(--font-outfit)' }}>
        {t.title}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Size selector */}
        {product.sizes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.size}</label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? 'border-2 text-white'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                  style={selectedSize === size ? { backgroundColor: design.accentColor, borderColor: design.accentColor } : {}}
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.color}</label>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedColor === color
                      ? 'border-2 text-white'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                  style={selectedColor === color ? { backgroundColor: design.accentColor, borderColor: design.accentColor } : {}}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.qty}</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-600 hover:bg-slate-50"
            >
              -
            </button>
            <span className="text-lg font-bold text-slate-900 w-8 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-600 hover:bg-slate-50"
            >
              +
            </button>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.name}</label>
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
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.phone}</label>
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
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.wilaya}</label>
          <WilayaSelect
            value={wilaya}
            onChange={(val) => { setWilaya(val); setCommune(''); }}
          />
        </div>

        {/* Delivery type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.deliveryType}</label>
          <div className="flex gap-3">
            {(['office', 'home'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setDeliveryType(type)}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  deliveryType === type ? 'text-white' : 'border-slate-200 text-slate-600'
                }`}
                style={deliveryType === type ? { backgroundColor: design.accentColor, borderColor: design.accentColor } : {}}
              >
                {type === 'office' ? t.office : t.home}
              </button>
            ))}
          </div>
        </div>

        {/* Commune */}
        {wilaya && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.commune}</label>
            <CommuneSelect
              wilayaName={wilaya}
              value={commune}
              onChange={setCommune}
            />
          </div>
        )}

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.address}</label>
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
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>{t.subtotal}</span>
            <span>{subtotal.toLocaleString()} DZD</span>
          </div>
          {deliveryFee !== null && (
            <div className="flex justify-between text-sm text-slate-600">
              <span>{t.delivery}</span>
              <span>{loadingFee ? '...' : `${deliveryFee.toLocaleString()} DZD`}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200" style={{ color: design.primaryColor }}>
            <span>{t.total}</span>
            <span>{total.toLocaleString()} DZD</span>
          </div>
        </div>

        {/* COD badge */}
        <div className="text-center text-sm text-slate-500 font-medium">
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
          className="w-full py-4 rounded-xl text-white font-bold text-lg transition-opacity disabled:opacity-60"
          style={{ backgroundColor: design.accentColor }}
        >
          {submitting ? t.submitting : (ctaText || t.submit)}
        </button>
      </form>
    </div>
  )
}
