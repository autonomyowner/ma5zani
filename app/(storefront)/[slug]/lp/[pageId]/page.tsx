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
