'use client'

import { useParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import LandingPageRenderer from '@/components/landing-page/LandingPageRenderer'

export default function PublicLandingPage() {
  const params = useParams()
  const pageId = params.pageId as string

  const data = useQuery(api.landingPages.getPublicLandingPage, { pageId })

  // Loading state
  if (data === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Storefront not published
  if (data && 'reason' in data && data.reason === 'storefront_not_published') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-outfit)' }}>
            المتجر غير منشور بعد
          </h1>
          <p className="text-slate-500 mb-1">يجب نشر المتجر أولاً حتى تظهر صفحة المنتج</p>
          <p className="text-slate-400 text-sm">The storefront must be published first for this page to be visible</p>
        </div>
      </div>
    )
  }

  // Not found
  if (data === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-outfit)' }}>
            404
          </h1>
          <p className="text-slate-500">Page not found</p>
        </div>
      </div>
    )
  }

  return (
    <LandingPageRenderer
      page={data.page}
      product={data.product}
      storefront={data.storefront}
    />
  )
}
