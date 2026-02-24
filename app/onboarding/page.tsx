'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { authClient } from '@/lib/auth-client'
import { useLanguage } from '@/lib/LanguageContext'
import Link from 'next/link'
import Image from 'next/image'
import { trackEvent, sendServerEvent, generateEventId, META_EVENTS } from '@/lib/meta-pixel'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import SlugInput from '@/components/ui/SlugInput'
import ImageUpload from '@/components/ui/ImageUpload'
import { getR2PublicUrl } from '@/lib/r2'

const COLOR_PRESETS = [
  { name: 'Blue', value: '#0054A6' },
  { name: 'Dark', value: '#1a1a2e' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Slate', value: '#475569' },
  { name: 'Rose', value: '#e11d48' },
]

interface WizardProduct {
  name: string
  price: string
  imageKeys: string[]
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
}

function generateSku(index: number): string {
  return `PROD-${Date.now().toString(36)}-${index}`
}

export default function OnboardingPage() {
  const router = useRouter()
  const { t, language, setLanguage, dir } = useLanguage()
  const { data: session, isPending } = authClient.useSession()

  const upsertSeller = useMutation(api.sellers.upsertSeller)
  const createStorefront = useMutation(api.storefronts.createStorefront)
  const createProduct = useMutation(api.products.createProduct)
  const publishStorefront = useMutation(api.storefronts.publishStorefront)

  const myStorefront = useQuery(api.storefronts.getMyStorefront)

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')

  // Step 1 state
  const [storeName, setStoreName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [themeColor, setThemeColor] = useState('#0054A6')
  const [logoKey, setLogoKey] = useState<string[]>([])

  // Step 2 state
  const [products, setProducts] = useState<WizardProduct[]>([
    { name: '', price: '', imageKeys: [] },
  ])

  // Step 3 state
  const [showConfetti, setShowConfetti] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [creatingStore, setCreatingStore] = useState(false)

  const w = t.wizard

  // Redirect guards
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login')
    }
  }, [isPending, session, router])

  useEffect(() => {
    // Skip redirect if we're creating the store or showing the success screen
    if (creatingStore || step === 3) return
    if (myStorefront !== undefined && myStorefront !== null) {
      router.push('/dashboard')
    }
  }, [myStorefront, router, step, creatingStore])

  // Auto-generate slug from store name
  useEffect(() => {
    if (!slugManual) {
      const generated = generateSlug(storeName)
      if (generated) {
        setSlug(generated)
      } else if (!storeName) {
        setSlug('')
      }
    }
  }, [storeName, slugManual])

  // Only block on auth session loading — don't wait for Convex query
  if (isPending) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-slate-200 border-t-[#0054A6] rounded-full animate-spin" />
          <p className="text-sm text-slate-400">{language === 'ar' ? 'جاري التحميل...' : language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
        </div>
      </main>
    )
  }

  if (!session) return null
  // Redirect to dashboard if they already have a storefront (non-blocking check)
  if (myStorefront && step !== 3 && !creatingStore) return null

  const storeUrl = `${slug}.ma5zani.com`

  const handleStep1Next = async () => {
    setError('')
    if (!storeName.trim()) {
      setError(w.storeNameRequired)
      return
    }
    if (!slug || slug.length < 3) {
      setError(w.slugRequired)
      return
    }

    try {
      setIsSubmitting(true)
      await upsertSeller({
        name: session.user?.name || 'Seller',
        email: session.user?.email || '',
        plan: 'basic',
      })
      setStep(2)
    } catch (err) {
      console.error('Failed to create seller:', err)
      setError(String(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateStore = async () => {
    setError('')
    const validProducts = products.filter(
      (p) => p.name.trim() && Number(p.price) > 0
    )
    if (validProducts.length === 0) {
      setError(w.minOneProduct)
      return
    }

    try {
      setIsSubmitting(true)
      setCreatingStore(true)

      // 1. Create storefront
      setStatusMessage(w.creating)
      await createStorefront({
        slug,
        boutiqueName: storeName,
        logoKey: logoKey[0] || undefined,
        theme: { primaryColor: themeColor, accentColor: '#F7941D' },
      })

      // 2. Create products
      setStatusMessage(w.creatingProducts)
      for (let i = 0; i < validProducts.length; i++) {
        const p = validProducts[i]
        await createProduct({
          name: p.name.trim(),
          sku: generateSku(i),
          stock: 99,
          price: Number(p.price),
          imageKeys: p.imageKeys.length > 0 ? p.imageKeys : undefined,
          showOnStorefront: true,
        })
      }

      // 3. Publish
      setStatusMessage(w.almostDone)
      await publishStorefront({ isPublished: true })

      // Track registration
      const eventId = generateEventId()
      trackEvent(META_EVENTS.COMPLETE_REGISTRATION, {
        content_name: 'basic',
        status: true,
      }, eventId)
      sendServerEvent({
        eventName: META_EVENTS.COMPLETE_REGISTRATION,
        eventId,
        sourceUrl: window.location.href,
        userData: {
          email: session.user?.email || undefined,
          firstName: session.user?.name?.split(' ')[0],
        },
        customData: { plan: 'basic' },
      })

      setStep(3)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4000)
    } catch (err) {
      console.error('Failed to create store:', err)
      setError(String(err))
    } finally {
      setIsSubmitting(false)
      setStatusMessage('')
    }
  }

  const updateProduct = (index: number, field: keyof WizardProduct, value: string | string[]) => {
    setProducts((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addProduct = () => {
    if (products.length < 5) {
      setProducts((prev) => [...prev, { name: '', price: '', imageKeys: [] }])
    }
  }

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${storeUrl}`)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleShare = async () => {
    const url = `https://${storeUrl}`
    if (navigator.share) {
      try {
        await navigator.share({ title: storeName, text: w.shareMessage, url })
      } catch { /* user cancelled */ }
    } else {
      handleCopyLink()
    }
  }

  const fontFamily = language === 'ar' ? 'var(--font-cairo), sans-serif' : 'var(--font-outfit), sans-serif'

  return (
    <main dir={dir} className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && <Confetti />}

      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#00AEEF]/5" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#F7941D]/5" />
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="ma5zani" width={40} height={40} className="h-10 w-auto" />
            <span className="text-xl font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              ma5zani
            </span>
          </Link>
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : language === 'en' ? 'fr' : 'ar')}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-[#0054A6] bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            {language === 'ar' ? 'EN' : language === 'en' ? 'FR' : 'عربي'}
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  s < step
                    ? 'bg-[#22B14C] text-white'
                    : s === step
                    ? 'bg-[#0054A6] text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    s < step ? 'bg-[#22B14C]' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Brand */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[#0054A6]" style={{ fontFamily }}>
                {w.step1Title}
              </h1>
              <p className="text-slate-500 mt-1">{w.step1Subtitle}</p>
            </div>

            {/* Store Name */}
            <Input
              id="store-name"
              label={w.storeName}
              placeholder={w.storeNamePlaceholder}
              value={storeName}
              onChange={(e) => {
                setStoreName(e.target.value)
                // If user was in manual mode and clears the name, reset
                if (!e.target.value) setSlugManual(false)
              }}
            />

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                {w.storeUrl}
              </label>
              <SlugInput
                value={slug}
                onChange={(val) => {
                  setSlug(val)
                  setSlugManual(true)
                }}
              />
            </div>

            {/* Color Presets */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                {w.chooseColor}
              </label>
              <div className="flex flex-wrap gap-3">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setThemeColor(color.value)}
                    className={`w-10 h-10 rounded-full transition-all ${
                      themeColor === color.value
                        ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                {w.uploadLogo}
              </label>
              {logoKey.length === 0 && storeName && (
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                    style={{ backgroundColor: themeColor }}
                  >
                    {storeName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-400">
                    {language === 'ar' ? 'الشعار الافتراضي' : language === 'fr' ? 'Logo par défaut' : 'Default logo'}
                  </span>
                </div>
              )}
              <ImageUpload
                id="logo-upload"
                value={logoKey}
                onChange={setLogoKey}
                maxImages={1}
                folder="logos"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
              onClick={handleStep1Next}
            >
              {isSubmitting ? '...' : w.next}
            </Button>
          </div>
        )}

        {/* Step 2: Products */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[#0054A6]" style={{ fontFamily }}>
                {w.step2Title}
              </h1>
              <p className="text-slate-500 mt-1">{w.step2Subtitle}</p>
            </div>

            <div className="space-y-4">
              {products.map((product, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-xl p-4 space-y-3 relative"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">
                      {w.product} {index + 1}
                    </span>
                    {products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        {w.removeProduct}
                      </button>
                    )}
                  </div>

                  {/* Photo */}
                  <ImageUpload
                    id={`product-upload-${index}`}
                    value={product.imageKeys}
                    onChange={(keys) => updateProduct(index, 'imageKeys', keys)}
                    maxImages={1}
                    folder="products"
                  />

                  {/* Name + Price row */}
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      id={`product-name-${index}`}
                      placeholder={w.productNamePlaceholder}
                      value={product.name}
                      onChange={(e) => updateProduct(index, 'name', e.target.value)}
                    />
                    <Input
                      id={`product-price-${index}`}
                      type="number"
                      placeholder={w.productPricePlaceholder}
                      value={product.price}
                      onChange={(e) => updateProduct(index, 'price', e.target.value)}
                      dir="ltr"
                    />
                  </div>
                </div>
              ))}
            </div>

            {products.length < 5 && (
              <button
                type="button"
                onClick={addProduct}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-[#0054A6] hover:text-[#0054A6] transition-colors text-sm font-medium"
              >
                + {w.addAnother}
              </button>
            )}

            <p className="text-center text-sm text-slate-400">{w.addMoreLater}</p>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="flex-1"
                disabled={isSubmitting}
                onClick={() => { setError(''); setStep(1) }}
              >
                {w.back}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="flex-[2]"
                disabled={isSubmitting}
                onClick={handleCreateStore}
              >
                {isSubmitting ? statusMessage || '...' : w.createMyStore}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Store is Live */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6 text-center">
            <div>
              <h1 className="text-2xl font-bold text-[#22B14C]" style={{ fontFamily }}>
                {w.step3Title}
              </h1>
              <p className="text-slate-500 mt-1">{w.step3Subtitle}</p>
            </div>

            {/* Phone Mockup */}
            <div className="flex justify-center">
              <div className="w-[220px] rounded-[24px] border-4 border-slate-800 bg-white overflow-hidden shadow-2xl">
                {/* Status bar */}
                <div className="h-6 bg-slate-800" />
                {/* Store header */}
                <div
                  className="px-3 py-2 text-white text-sm font-bold truncate"
                  style={{ backgroundColor: themeColor }}
                >
                  {logoKey[0] ? (
                    <img src={getR2PublicUrl(logoKey[0])} alt="" className="inline h-4 w-4 rounded-full mr-1 object-cover" />
                  ) : (
                    <span
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] mr-1"
                      style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                    >
                      {storeName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {storeName}
                </div>
                {/* Product grid mockup */}
                <div className="grid grid-cols-2 gap-1.5 p-2">
                  {products
                    .filter((p) => p.name.trim() && Number(p.price) > 0)
                    .slice(0, 4)
                    .map((p, i) => (
                      <div key={i} className="rounded-lg overflow-hidden border border-slate-100">
                        <div className="aspect-square bg-slate-100 flex items-center justify-center">
                          {p.imageKeys[0] ? (
                            <img
                              src={getR2PublicUrl(p.imageKeys[0])}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                              <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-1">
                          <p className="text-[8px] text-slate-700 truncate">{p.name}</p>
                          <p className="text-[8px] font-bold" style={{ color: themeColor }}>
                            {Number(p.price).toLocaleString()} DA
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Store URL */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-slate-500">{w.yourStoreUrl}</p>
              <p className="text-lg font-bold text-[#0054A6] break-all" dir="ltr">
                {storeUrl}
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  {linkCopied ? w.copied : w.copyLink}
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                  style={{ backgroundColor: themeColor }}
                >
                  {w.share}
                </button>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => router.push('/dashboard')}
            >
              {w.goToDashboard}
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}

/** CSS-only confetti animation — no dependencies */
function Confetti() {
  const colors = ['#0054A6', '#00AEEF', '#F7941D', '#22B14C', '#e11d48', '#7c3aed']
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 2,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 6,
    rotation: Math.random() * 360,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: 0,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: 2,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  )
}
