'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useLanguage } from '@/lib/LanguageContext'
import { useCurrentSeller } from '@/hooks/useCurrentSeller'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function TelegramPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { seller, isLoading, isAuthenticated } = useCurrentSeller()
  const telegramLink = useQuery(api.telegram.getTelegramLink)
  const generateCode = useMutation(api.telegram.generateVerificationCode)
  const unlinkTelegram = useMutation(api.telegram.unlinkTelegram)

  const [code, setCode] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUnlinking, setIsUnlinking] = useState(false)

  // Auth protection
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isLoading, isAuthenticated])

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setCountdown(remaining)
      if (remaining === 0) {
        setCode(null)
        setExpiresAt(null)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  if (isLoading || seller === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">{t.dashboard.loading}</div>
      </div>
    )
  }

  if (seller === null && isAuthenticated) {
    router.push('/onboarding')
    return null
  }

  const isLinked = telegramLink?.status === 'linked'

  const handleGenerateCode = async () => {
    setIsGenerating(true)
    try {
      const result = await generateCode()
      setCode(result.code)
      setExpiresAt(result.expiresAt)
    } catch (error) {
      console.error('Failed to generate code:', error)
    }
    setIsGenerating(false)
  }

  const handleUnlink = async () => {
    if (!confirm(t.telegram.confirmUnlink)) return
    setIsUnlinking(true)
    try {
      await unlinkTelegram()
      setCode(null)
      setExpiresAt(null)
    } catch (error) {
      console.error('Failed to unlink:', error)
    }
    setIsUnlinking(false)
  }

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <DashboardLayout
      seller={seller}
      title={t.telegram.title}
      subtitle={t.telegram.subtitle}
    >
      <div className="max-w-3xl space-y-4 lg:space-y-8">
        {/* Connection Status */}
        <Card className="p-4 lg:p-6">
          <h2 className="text-base lg:text-lg font-bold text-[#0054A6] mb-4" style={{ fontFamily: 'var(--font-outfit)' }}>
            {t.telegram.connectionStatus}
          </h2>

          {isLinked ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="w-3 h-3 rounded-full bg-[#22B14C]" />
                <div>
                  <p className="font-medium text-green-800">{t.telegram.connected}</p>
                  {telegramLink?.telegramUsername && (
                    <p className="text-sm text-green-600">
                      @{telegramLink.telegramUsername}
                    </p>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleUnlink}
                disabled={isUnlinking}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                {isUnlinking ? t.dashboard.loading : t.telegram.disconnect}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <p className="text-slate-600">{t.telegram.notConnected}</p>
              </div>

              {code ? (
                <div className="space-y-3">
                  <div className="p-4 bg-[#0054A6]/5 border border-[#0054A6]/20 rounded-xl text-center">
                    <p className="text-sm text-slate-500 mb-2">{t.telegram.yourCode}</p>
                    <p
                      className="text-3xl lg:text-4xl font-mono font-bold text-[#0054A6] tracking-[0.3em]"
                      style={{ fontFamily: 'var(--font-outfit)' }}
                    >
                      {code}
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                      {t.telegram.expiresIn} {formatCountdown(countdown)}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">
                    {t.telegram.sendCodeInstructions}
                  </p>
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleGenerateCode}
                  disabled={isGenerating}
                >
                  {isGenerating ? t.dashboard.loading : t.telegram.generateCode}
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* How It Works */}
        <Card className="p-4 lg:p-6">
          <h2 className="text-base lg:text-lg font-bold text-[#0054A6] mb-4" style={{ fontFamily: 'var(--font-outfit)' }}>
            {t.telegram.howItWorks}
          </h2>
          <div className="space-y-3">
            {[
              t.telegram.step1,
              t.telegram.step2,
              t.telegram.step3,
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0054A6] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-slate-600 text-sm lg:text-base">{step}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Commands Reference */}
        {isLinked && (
          <Card className="p-4 lg:p-6">
            <h2 className="text-base lg:text-lg font-bold text-[#0054A6] mb-4" style={{ fontFamily: 'var(--font-outfit)' }}>
              {t.telegram.commandsTitle}
            </h2>
            <div className="space-y-2">
              {[
                { cmd: '/add', desc: t.telegram.cmdAdd },
                { cmd: '/products', desc: t.telegram.cmdProducts },
                { cmd: '/orders', desc: t.telegram.cmdOrders },
                { cmd: '/stats', desc: t.telegram.cmdStats },
                { cmd: '/price', desc: t.telegram.cmdPrice },
                { cmd: '/stock', desc: t.telegram.cmdStock },
                { cmd: '/hide', desc: t.telegram.cmdHide },
                { cmd: '/show', desc: t.telegram.cmdShow },
                { cmd: '/delete', desc: t.telegram.cmdDelete },
              ].map((item) => (
                <div key={item.cmd} className="flex items-start gap-3 py-1">
                  <code className="text-sm font-mono text-[#0054A6] bg-[#0054A6]/5 px-2 py-0.5 rounded min-w-[90px]">
                    {item.cmd}
                  </code>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500">
                <span className="font-medium text-slate-700">{t.telegram.quickAddTip}:</span>{' '}
                {t.telegram.quickAddDesc}
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
