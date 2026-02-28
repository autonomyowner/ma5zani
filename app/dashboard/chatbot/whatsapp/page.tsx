'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useLanguage } from '@/lib/LanguageContext'
import { localText } from '@/lib/translations'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { sellerHasAccess } from '@/lib/sellerAccess'
import FounderOfferGate from '@/components/dashboard/FounderOfferGate'

const GATEWAY_URL = process.env.NEXT_PUBLIC_WHATSAPP_GATEWAY_URL

export default function WhatsAppPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const isRTL = language === 'ar'
  const cb = t.chatbot
  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const session = useQuery(api.whatsappSessions.getSession)
  const disconnectSession = useMutation(api.whatsappSessions.disconnectSession)

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pollingStatus, setPollingStatus] = useState<string | null>(null)

  // Poll for connection status while QR is showing
  const pollStatus = useCallback(async () => {
    if (!seller || !GATEWAY_URL) return
    try {
      const res = await fetch(
        `${GATEWAY_URL}/api/sellers/${seller._id}/status`,
        {
          headers: {
            'x-gateway-secret': process.env.NEXT_PUBLIC_WHATSAPP_GATEWAY_SECRET || '',
          },
        }
      )
      if (res.ok) {
        const data = await res.json()
        setPollingStatus(data.status)
        if (data.status === 'connected') {
          setQrDataUrl(null)
        }
      }
    } catch {
      // Ignore polling errors
    }
  }, [seller])

  useEffect(() => {
    if (!qrDataUrl) return
    const interval = setInterval(pollStatus, 3000)
    return () => clearInterval(interval)
  }, [qrDataUrl, pollStatus])

  if (seller === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">{t.dashboard.loading}</div>
      </div>
    )
  }

  if (seller === null) {
    router.push('/onboarding')
    return null
  }

  if (seller && !sellerHasAccess(seller)) {
    return (
      <DashboardLayout seller={seller} title={cb.whatsappIntegration}>
        <FounderOfferGate />
      </DashboardLayout>
    )
  }

  const handleConnect = async () => {
    if (!GATEWAY_URL) {
      setError(cb.gatewayNotConfigured)
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(
        `${GATEWAY_URL}/api/sellers/${seller!._id}/qr`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-gateway-secret': process.env.NEXT_PUBLIC_WHATSAPP_GATEWAY_SECRET || '',
          },
        }
      )
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate QR')
      }
      const data = await res.json()
      setQrDataUrl(data.qr)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
    }
    setLoading(false)
  }

  const handleDisconnect = async () => {
    setLoading(true)
    try {
      // Disconnect in gateway if configured
      if (GATEWAY_URL) {
        await fetch(
          `${GATEWAY_URL}/api/sellers/${seller!._id}/disconnect`,
          {
            method: 'POST',
            headers: {
              'x-gateway-secret': process.env.NEXT_PUBLIC_WHATSAPP_GATEWAY_SECRET || '',
            },
          }
        )
      }
      // Update Convex session status
      await disconnectSession({})
      setQrDataUrl(null)
      setPollingStatus(null)
    } catch (err) {
      console.error('Disconnect error:', err)
    }
    setLoading(false)
  }

  const currentStatus = pollingStatus || session?.status || 'disconnected'
  const isConnected = currentStatus === 'connected'
  const isQrPending = currentStatus === 'qr_pending' || !!qrDataUrl

  return (
    <DashboardLayout
      seller={seller}
      title={cb.whatsappIntegration}
      subtitle={cb.whatsappDesc}
    >
      <div className="max-w-2xl space-y-4 lg:space-y-6">
        {/* Status Card */}
        <Card className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2
              className="text-base lg:text-lg font-bold text-[#0054A6]"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              {cb.whatsapp}
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isConnected
                  ? 'bg-[#22B14C]/10 text-[#22B14C]'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-[#22B14C] animate-pulse' : 'bg-slate-400'
                }`}
              />
              {isConnected ? cb.connected : cb.disconnected}
            </span>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
              {error === cb.gatewayNotConfigured && (
                <p className="mt-1 text-xs text-red-400">
                  {cb.gatewayNotConfiguredDesc}
                </p>
              )}
            </div>
          )}

          {/* Disconnected State */}
          {!isConnected && !isQrPending && (
            <div className="text-center py-6 lg:py-10">
              {/* WhatsApp icon */}
              <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 bg-[#22B14C]/10 rounded-full flex items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22B14C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <p className="text-slate-600 mb-6 text-sm lg:text-base">
                {cb.whatsappDesc}
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={handleConnect}
                disabled={loading}
                className="!bg-[#22B14C] hover:!bg-[#1a8f3c]"
              >
                {loading ? cb.connecting : cb.connectWhatsApp}
              </Button>
            </div>
          )}

          {/* QR Code State */}
          {isQrPending && qrDataUrl && (
            <div className="text-center py-4 lg:py-6">
              <p className="text-sm lg:text-base font-medium text-slate-700 mb-4">
                {cb.scanQR}
              </p>
              <div className="inline-block p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-sm mb-4">
                <img
                  src={qrDataUrl}
                  alt="WhatsApp QR Code"
                  className="w-56 h-56 lg:w-64 lg:h-64"
                />
              </div>
              <p className="text-xs lg:text-sm text-slate-500 max-w-sm mx-auto">
                {cb.scanInstructions}
              </p>
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQrDataUrl(null)
                    setPollingStatus(null)
                  }}
                >
                  {t.dashboard.cancel}
                </Button>
              </div>
            </div>
          )}

          {/* QR Pending without data URL (loading state) */}
          {isQrPending && !qrDataUrl && (
            <div className="text-center py-6 lg:py-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-[#22B14C] rounded-full animate-spin" />
              </div>
              <p className="text-slate-500 text-sm">{cb.connecting}</p>
            </div>
          )}

          {/* Connected State */}
          {isConnected && (
            <div className="space-y-4">
              {/* Phone number */}
              {session?.phoneNumber && (
                <div className="flex items-center justify-between p-3 lg:p-4 bg-[#22B14C]/5 rounded-xl">
                  <div>
                    <p className="text-xs text-slate-500">{cb.phoneNumber}</p>
                    <p className="font-medium text-slate-900 font-mono">
                      +{session.phoneNumber}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-[#22B14C]/10 rounded-full flex items-center justify-center">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22B14C"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Connected since */}
              {session?.connectedAt && (
                <div className="flex items-center justify-between p-3 lg:p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-xs text-slate-500">{cb.connectedSince}</p>
                    <p className="font-medium text-slate-900 text-sm">
                      {new Date(session.connectedAt).toLocaleDateString(
                        isRTL ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Disconnect button */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="!border-red-300 !text-red-600 hover:!bg-red-50"
                >
                  {cb.disconnectWhatsApp}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* How it works */}
        <Card className="p-4 lg:p-6">
          <h3
            className="text-base lg:text-lg font-bold text-[#0054A6] mb-4"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            {cb.howItWorks}
          </h3>
          <div className="space-y-3">
            {[cb.step1, cb.step2, cb.step3, cb.step4].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: i === 3 ? '#22B14C' : '#0054A6' }}
                >
                  {i + 1}
                </div>
                <p className="text-sm lg:text-base text-slate-700 pt-0.5">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Info note */}
        <Card className="p-4 lg:p-6 !bg-blue-50 border border-blue-100">
          <div className="flex items-start gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0054A6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <p className="text-sm text-[#0054A6] font-medium mb-1">
                {localText(language, {
                  ar: 'ملاحظة مهمة',
                  en: 'Important note',
                  fr: 'Note importante',
                })}
              </p>
              <p className="text-xs lg:text-sm text-blue-700/80">
                {localText(language, {
                  ar: 'يجب أن يكون المساعد الذكي مفعّلاً ومدرّباً قبل ربط واتساب. الردود التلقائية ستستخدم نفس قاعدة المعرفة والإعدادات.',
                  en: 'Your AI assistant must be enabled and trained before connecting WhatsApp. Auto-replies will use the same knowledge base and settings.',
                  fr: 'Votre assistant IA doit etre active et forme avant de connecter WhatsApp. Les reponses automatiques utiliseront la meme base de connaissances et parametres.',
                })}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
