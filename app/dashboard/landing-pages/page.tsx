'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import FounderOfferGate from '@/components/dashboard/FounderOfferGate'
import ProductPickerModal from '@/components/dashboard/ProductPickerModal'
import { getR2PublicUrl } from '@/lib/r2'

function generatePageId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function LandingPagesPage() {
  const { t } = useLanguage()
  const lp = t.landingPages

  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const storefront = useQuery(api.storefronts.getMyStorefront)
  const landingPages = useQuery(api.landingPages.getMyLandingPages)

  const createLP = useMutation(api.landingPages.createLandingPage)
  const updateStatus = useMutation(api.landingPages.updateLandingPageStatus)
  const deleteLP = useMutation(api.landingPages.deleteLandingPage)

  const [showPicker, setShowPicker] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [genError, setGenError] = useState('')

  // Activation gate
  if (seller && !seller.isActivated) {
    return (
      <DashboardLayout seller={seller} title={lp?.title || 'Landing Pages'}>
        <FounderOfferGate />
      </DashboardLayout>
    )
  }

  const handleProductSelect = async (product: Doc<'products'>) => {
    if (!seller || !storefront) return

    setShowPicker(false)
    setGenerating(true)
    setGenError('')

    try {
      const pageId = generatePageId()

      // Create LP record
      const lpId = await createLP({
        storefrontId: storefront._id,
        productId: product._id,
        pageId,
      })

      // Trigger AI generation
      const res = await fetch('/api/landing-pages/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: seller._id,
          productId: product._id,
          storefrontId: storefront._id,
          landingPageId: lpId,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setGenError(data.error || 'Generation failed. Please try again.')
      }
    } catch (error) {
      console.error('Failed to generate landing page:', error)
      setGenError('Network error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopyLink = (slug: string, pageId: string) => {
    const url = `${window.location.origin}/${slug}/lp/${pageId}`
    navigator.clipboard.writeText(url)
    setCopiedId(pageId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handlePublish = async (id: any, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    await updateStatus({ id, status: newStatus })
  }

  const handleDelete = async (id: any) => {
    if (!confirm(lp?.deleteConfirm || 'Are you sure?')) return
    await deleteLP({ id })
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      generating: 'bg-blue-100 text-blue-700',
      draft: 'bg-yellow-100 text-yellow-700',
      published: 'bg-green-100 text-green-700',
    }
    const labels: Record<string, string> = {
      generating: lp?.generating || 'Generating...',
      draft: lp?.draft || 'Draft',
      published: lp?.published || 'Published',
    }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <DashboardLayout
      seller={seller}
      title={lp?.title || 'Landing Pages'}
      subtitle={lp?.subtitle || 'Create AI-powered sales pages'}
      headerActions={
        <button
          onClick={() => setShowPicker(true)}
          disabled={generating || !storefront}
          className="px-5 py-2.5 bg-[#0054A6] text-white rounded-xl font-medium hover:bg-[#004590] transition-colors disabled:opacity-50"
        >
          {generating ? (lp?.generating || 'Generating...') : (lp?.generate || 'Generate New Page')}
        </button>
      }
    >
      {/* Generating state */}
      {generating && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-700 font-medium">{lp?.generatingDesc || 'AI is writing your page content...'}</p>
        </div>
      )}

      {/* Error state */}
      {genError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 font-medium">{genError}</p>
        </div>
      )}

      {/* Landing pages list */}
      {!landingPages ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : landingPages.length === 0 && !generating ? (
        <div className="text-center py-16">
          <h3 className="text-lg font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-outfit)' }}>
            {lp?.noPages || 'No landing pages yet'}
          </h3>
          <p className="text-slate-500 mb-6">{lp?.noPagesDesc || 'Create your first landing page'}</p>
          <button
            onClick={() => setShowPicker(true)}
            disabled={!storefront}
            className="px-6 py-3 bg-[#0054A6] text-white rounded-xl font-medium hover:bg-[#004590] transition-colors disabled:opacity-50"
          >
            {lp?.generate || 'Generate New Page'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {landingPages.map((page) => (
            <div
              key={page._id}
              className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4"
            >
              {/* Product image */}
              <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                {page.productImage ? (
                  <img
                    src={getR2PublicUrl(page.productImage)}
                    alt={page.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    No img
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">
                  {page.content.headline || page.productName}
                </p>
                <p className="text-sm text-slate-500 truncate">{page.productName}</p>
                <div className="flex items-center gap-3 mt-1">
                  {statusBadge(page.status)}
                  <span className="text-xs text-slate-400">
                    {lp?.views || 'Views'}: {page.viewCount || 0}
                  </span>
                  <span className="text-xs text-slate-400">
                    {lp?.orders || 'Orders'}: {page.orderCount || 0}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {page.status !== 'generating' && (
                  <>
                    <button
                      onClick={() => handleCopyLink(page.storefrontSlug, page.pageId)}
                      className="px-3 py-1.5 text-sm text-slate-600 hover:text-[#0054A6] hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      {copiedId === page.pageId ? (lp?.copied || 'Copied') : (lp?.copyLink || 'Copy Link')}
                    </button>
                    <a
                      href={`/${page.storefrontSlug}/lp/${page.pageId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-sm text-slate-600 hover:text-[#0054A6] hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      {lp?.preview || 'Preview'}
                    </a>
                    <button
                      onClick={() => handlePublish(page._id, page.status)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        page.status === 'published'
                          ? 'text-yellow-600 hover:bg-yellow-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {page.status === 'published' ? (lp?.unpublish || 'Unpublish') : (lp?.publish || 'Publish')}
                    </button>
                    <button
                      onClick={() => handleDelete(page._id)}
                      className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {lp?.delete || 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product picker modal */}
      {showPicker && seller && (
        <ProductPickerModal
          sellerId={seller._id}
          onSelect={handleProductSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </DashboardLayout>
  )
}
