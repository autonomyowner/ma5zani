'use client'

import { useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import { localText } from '@/lib/translations'
import { getR2PublicUrl } from '@/lib/r2'
import LandingPageOrderForm from './LandingPageOrderForm'

interface LandingPageRendererProps {
  page: {
    pageId: string
    content: {
      headline: string
      subheadline: string
      featureBullets: Array<{ title: string; description: string }>
      ctaText: string
      urgencyText?: string
      productDescription: string
      socialProof?: string
    }
    design: {
      primaryColor: string
      accentColor: string
      backgroundColor: string
      textColor: string
    }
  }
  product: {
    _id: Id<'products'>
    name: string
    price: number
    salePrice?: number
    imageKeys: string[]
    sizes: string[]
    colors: string[]
    stock: number
    status: string
  }
  storefront: {
    _id: Id<'storefronts'>
    slug: string
    boutiqueName: string
    sellerId: Id<'sellers'>
    metaPixelId?: string
  }
}

export default function LandingPageRenderer({ page, product, storefront }: LandingPageRendererProps) {
  const { language } = useLanguage()
  const incrementViews = useMutation(api.landingPages.incrementViewCount)
  const isRTL = language === 'ar'

  // Track page view on mount
  useEffect(() => {
    incrementViews({ pageId: page.pageId })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { content, design } = page
  const hasDiscount = product.salePrice && product.salePrice < product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0

  const mainImage = product.imageKeys[0] ? getR2PublicUrl(product.imageKeys[0]) : null
  const galleryImages = product.imageKeys.map((k) => getR2PublicUrl(k))

  const scrollToOrder = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className="min-h-screen"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ backgroundColor: design.backgroundColor, color: design.textColor }}
    >
      {/* === HERO SECTION === */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image */}
            <div className={`${isRTL ? 'lg:order-2' : 'lg:order-1'} order-1`}>
              {mainImage && (
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {hasDiscount && (
                    <div
                      className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-white font-bold text-sm"
                      style={{ backgroundColor: design.accentColor }}
                    >
                      -{discountPercent}%
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Text content */}
            <div className={`${isRTL ? 'lg:order-1' : 'lg:order-2'} order-2`}>
              {/* Urgency badge */}
              {content.urgencyText && (
                <div
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4"
                  style={{
                    backgroundColor: design.accentColor + '15',
                    color: design.accentColor,
                  }}
                >
                  {content.urgencyText}
                </div>
              )}

              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
                style={{ color: design.primaryColor, fontFamily: 'var(--font-outfit)' }}
              >
                {content.headline}
              </h1>

              <p className="text-lg sm:text-xl mb-6 opacity-80">
                {content.subheadline}
              </p>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                {hasDiscount ? (
                  <>
                    <span
                      className="text-3xl font-bold"
                      style={{ color: design.accentColor }}
                    >
                      {product.salePrice!.toLocaleString()} DZD
                    </span>
                    <span className="text-xl text-slate-400 line-through">
                      {product.price.toLocaleString()} DZD
                    </span>
                  </>
                ) : (
                  <span
                    className="text-3xl font-bold"
                    style={{ color: design.accentColor }}
                  >
                    {product.price.toLocaleString()} DZD
                  </span>
                )}
              </div>

              {/* CTA button */}
              <button
                onClick={scrollToOrder}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-bold text-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: design.accentColor }}
              >
                {content.ctaText}
              </button>

              {/* Social proof */}
              {content.socialProof && (
                <p className="mt-4 text-sm opacity-60">{content.socialProof}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* === TRUST BADGES === */}
      <section className="py-6 border-y" style={{ borderColor: design.textColor + '15' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-2">
              <span className="text-xl">&#10004;</span>
              <span className="text-sm font-medium">
                {localText(language, { ar: 'الدفع عند الاستلام', en: 'Cash on Delivery', fr: 'Paiement a la livraison' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">&#10004;</span>
              <span className="text-sm font-medium">
                {localText(language, { ar: 'توصيل لكل 58 ولاية', en: 'Delivery to all 58 wilayas', fr: 'Livraison dans les 58 wilayas' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">&#10004;</span>
              <span className="text-sm font-medium">
                {localText(language, { ar: 'منتج أصلي', en: 'Authentic Product', fr: 'Produit authentique' })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* === BENEFITS SECTION === */}
      {content.featureBullets.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.featureBullets.map((bullet, i) => (
                <div
                  key={i}
                  className="rounded-xl p-6 transition-shadow hover:shadow-md"
                  style={{
                    backgroundColor: design.primaryColor + '08',
                    borderLeft: isRTL ? 'none' : `4px solid ${design.accentColor}`,
                    borderRight: isRTL ? `4px solid ${design.accentColor}` : 'none',
                  }}
                >
                  <h3 className="font-bold text-lg mb-2" style={{ color: design.primaryColor }}>
                    {bullet.title}
                  </h3>
                  <p className="text-sm opacity-70">{bullet.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* === PRODUCT DETAILS + IMAGE GALLERY === */}
      <section className="py-12 sm:py-16" style={{ backgroundColor: design.primaryColor + '05' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Gallery */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-2 gap-3">
                {galleryImages.slice(0, 4).map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden">
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className={galleryImages.length <= 1 ? 'lg:col-span-2 max-w-2xl mx-auto' : ''}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: design.primaryColor, fontFamily: 'var(--font-outfit)' }}
              >
                {product.name}
              </h2>
              <p className="text-base leading-relaxed opacity-80 whitespace-pre-line">
                {content.productDescription}
              </p>

              {/* CTA repeat */}
              <button
                onClick={scrollToOrder}
                className="mt-6 px-8 py-4 rounded-xl text-white font-bold text-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: design.accentColor }}
              >
                {content.ctaText}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* === ORDER FORM === */}
      <section className="py-12 sm:py-16">
        <div className="max-w-lg mx-auto px-4">
          <LandingPageOrderForm
            product={product}
            storefront={storefront}
            pageId={page.pageId}
            design={design}
            ctaText={content.ctaText}
          />
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="py-6 text-center text-sm opacity-50" style={{ borderTop: `1px solid ${design.textColor}15` }}>
        <p>{storefront.boutiqueName}</p>
      </footer>
    </div>
  )
}
