'use client'

import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import { useState } from 'react'

interface YalidineOrderActionsProps {
  orderId: Id<'orders'>
  yalidineTracking?: string
  yalidineStatus?: string
  hasDeliverySettings: boolean
}

export default function YalidineOrderActions({
  orderId,
  yalidineTracking,
  yalidineStatus,
  hasDeliverySettings,
}: YalidineOrderActionsProps) {
  const { t } = useLanguage()
  const submitToYalidine = useMutation(api.delivery.submitToYalidine)
  const [loading, setLoading] = useState(false)

  if (!hasDeliverySettings) return null

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await submitToYalidine({ orderId })
    } catch (err) {
      console.error('Failed to submit to Yalidine:', err)
    }
    setLoading(false)
  }

  // Already submitted with tracking
  if (yalidineTracking) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
          {t.dashboard.yalidineSubmitted}
        </span>
        <span className="text-xs text-slate-500 font-mono">{yalidineTracking}</span>
      </div>
    )
  }

  // Submitting in progress
  if (yalidineStatus === 'submitting') {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
        {t.dashboard.submittingToYalidine}
      </span>
    )
  }

  // Failed - show retry
  if (yalidineStatus === 'failed') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
          {t.dashboard.yalidineSubmitFailed}
        </span>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="text-xs px-2 py-1 rounded-lg bg-[#0054A6] text-white hover:bg-[#0054A6]/90 disabled:opacity-50"
        >
          {t.dashboard.yalidineRetry}
        </button>
      </div>
    )
  }

  // Default: show submit button
  return (
    <button
      onClick={handleSubmit}
      disabled={loading}
      className="text-xs px-3 py-1.5 rounded-lg bg-[#0054A6] text-white hover:bg-[#0054A6]/90 disabled:opacity-50 font-medium transition-colors"
    >
      {loading ? t.dashboard.submittingToYalidine : t.dashboard.sendToYalidine}
    </button>
  )
}
