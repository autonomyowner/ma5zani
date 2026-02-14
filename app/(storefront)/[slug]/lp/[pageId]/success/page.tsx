'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import { localText } from '@/lib/translations'
import Link from 'next/link'

export default function LandingPageSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const { language } = useLanguage()
  const isRTL = language === 'ar'

  const orderId = searchParams.get('orderId')
  const order = useQuery(
    api.publicOrders.getPublicOrder,
    orderId ? { orderId: orderId as Id<'orders'> } : 'skip'
  )

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full text-center">
        {/* Success checkmark */}
        <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-4xl mx-auto mb-6">
          &#10003;
        </div>

        <h1
          className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2"
          style={{ fontFamily: 'var(--font-outfit)' }}
        >
          {localText(language, {
            ar: 'تم الطلب بنجاح',
            en: 'Order Placed Successfully',
            fr: 'Commande Passee avec Succes',
          })}
        </h1>

        <p className="text-slate-500 mb-8">
          {localText(language, {
            ar: 'راح نتواصلو معاك قريباً لتأكيد الطلب',
            en: 'We will contact you soon to confirm your order',
            fr: 'Nous vous contacterons bientot pour confirmer votre commande',
          })}
        </p>

        {/* Order details */}
        {order && (
          <div className="bg-slate-50 rounded-xl p-6 mb-6 text-left">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">
                  {localText(language, { ar: 'رقم الطلب', en: 'Order Number', fr: 'Numero' })}
                </span>
                <span className="text-sm font-bold text-slate-900">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">
                  {localText(language, { ar: 'المنتج', en: 'Product', fr: 'Produit' })}
                </span>
                <span className="text-sm text-slate-900">{order.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">
                  {localText(language, { ar: 'الكمية', en: 'Quantity', fr: 'Quantite' })}
                </span>
                <span className="text-sm text-slate-900">{order.quantity}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900">
                  {localText(language, { ar: 'المبلغ', en: 'Amount', fr: 'Montant' })}
                </span>
                <span className="font-bold text-slate-900">{order.amount.toLocaleString()} DZD</span>
              </div>
              {order.deliveryFee && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">
                    {localText(language, { ar: 'التوصيل', en: 'Delivery', fr: 'Livraison' })}
                  </span>
                  <span className="text-sm text-slate-900">{order.deliveryFee.toLocaleString()} DZD</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back to store */}
        <Link
          href={`/${slug}`}
          className="inline-block px-6 py-3 bg-[#0054A6] text-white rounded-xl font-medium hover:bg-[#004590] transition-colors"
        >
          {localText(language, {
            ar: 'زيارة المتجر',
            en: 'Visit Store',
            fr: 'Visiter la Boutique',
          })}
        </Link>
      </div>
    </div>
  )
}
