'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { authClient } from '@/lib/auth-client'
import { useLanguage } from '@/lib/LanguageContext'
import Link from 'next/link'
import Image from 'next/image'
import { trackEvent, sendServerEvent, generateEventId, META_EVENTS } from '@/lib/meta-pixel'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

const planIds = ['basic', 'plus', 'gros'] as const

export default function OnboardingPage() {
  const router = useRouter()
  const { t, language, setLanguage, dir } = useLanguage()
  const { data: session, isPending } = authClient.useSession()
  const upsertSeller = useMutation(api.sellers.upsertSeller)

  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'plus' | 'gros'>('plus')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login')
    }
  }, [isPending, session, router])

  if (isPending) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">{t.auth.onboarding.loading}</div>
      </main>
    )
  }

  if (!session) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await upsertSeller({
        name: session.user?.name || 'Seller',
        email: session.user?.email || '',
        phone: phone || undefined,
        plan: selectedPlan,
      })

      // Track CompleteRegistration event
      const eventId = generateEventId();
      trackEvent(META_EVENTS.COMPLETE_REGISTRATION, {
        content_name: selectedPlan,
        status: true,
      }, eventId);
      sendServerEvent({
        eventName: META_EVENTS.COMPLETE_REGISTRATION,
        eventId,
        sourceUrl: window.location.href,
        userData: {
          email: session.user?.email || undefined,
          firstName: session.user?.name?.split(' ')[0],
          phone: phone || undefined,
        },
        customData: { plan: selectedPlan },
      });

      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to create seller:', err)
      setError(t.auth.onboarding.failedSetup)
    } finally {
      setIsSubmitting(false)
    }
  }

  const plans = [
    {
      id: 'basic' as const,
      name: t.auth.onboarding.plans.basic.name,
      price: '1,000',
      features: t.auth.onboarding.plans.basic.features,
    },
    {
      id: 'plus' as const,
      name: t.auth.onboarding.plans.plus.name,
      price: '3,900',
      features: t.auth.onboarding.plans.plus.features,
      popular: true,
    },
    {
      id: 'gros' as const,
      name: t.auth.onboarding.plans.gros.name,
      price: '7,900',
      features: t.auth.onboarding.plans.gros.features,
    },
  ]

  return (
    <main dir={dir} className="min-h-screen bg-slate-50 py-12 px-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#00AEEF]/5" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#F7941D]/5" />
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-[#0054A6] bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            {language === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <Image
              src="/logo.png"
              alt="ma5zani"
              width={80}
              height={80}
              className="h-20 w-auto"
            />
            <span
              className="text-3xl font-bold text-[#0054A6]"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
            >
              ma5zani
            </span>
          </Link>
        </div>

        <Card variant="elevated" className="shadow-xl">
          <div className="text-center mb-8">
            <h1
              className="text-2xl font-bold text-[#0054A6] mb-2"
              style={{ fontFamily: language === 'ar' ? 'var(--font-cairo), sans-serif' : 'var(--font-outfit), sans-serif' }}
            >
              {t.auth.onboarding.welcome} {session.user?.name?.split(' ')[0] || t.auth.onboarding.defaultName}!
            </h1>
            <p className="text-slate-600">
              {t.auth.onboarding.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information */}
            <div>
              <h2
                className="text-lg font-semibold text-[#0054A6] mb-4"
                style={{ fontFamily: language === 'ar' ? 'var(--font-cairo), sans-serif' : 'var(--font-outfit), sans-serif' }}
              >
                {t.auth.onboarding.contactInfo}
              </h2>
              <Input
                id="phone"
                type="tel"
                label={t.auth.onboarding.phone}
                placeholder={t.auth.onboarding.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Plan Selection */}
            <div>
              <h2
                className="text-lg font-semibold text-[#0054A6] mb-4"
                style={{ fontFamily: language === 'ar' ? 'var(--font-cairo), sans-serif' : 'var(--font-outfit), sans-serif' }}
              >
                {t.auth.onboarding.choosePlan}
              </h2>

              {/* Free Trial Banner */}
              <div className="mb-4 p-4 bg-[#22B14C]/10 border-2 border-[#22B14C] rounded-xl">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-bold text-[#22B14C] text-lg" style={{ fontFamily: language === 'ar' ? 'var(--font-cairo), sans-serif' : 'var(--font-outfit), sans-serif' }}>
                      {t.trial.startTrial}
                    </p>
                    <p className="text-sm text-slate-600">
                      {t.trial.trialIncluded}
                    </p>
                  </div>
                  <span className="bg-[#22B14C] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    14 {language === 'ar' ? 'يوم' : language === 'fr' ? 'jours' : 'days'}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative p-4 rounded-xl border-2 text-start transition-all ${
                      selectedPlan === plan.id
                        ? 'border-[#0054A6] bg-[#0054A6]/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2 right-2 bg-[#F7941D] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        {t.auth.onboarding.popular}
                      </span>
                    )}
                    <h3
                      className="font-bold text-[#0054A6]"
                      style={{ fontFamily: language === 'ar' ? 'var(--font-cairo), sans-serif' : 'var(--font-outfit), sans-serif' }}
                    >
                      {plan.name}
                    </h3>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {plan.price} <span className="text-sm font-normal text-slate-500">{t.auth.onboarding.currency}</span>
                    </p>
                    <ul className="mt-3 space-y-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                          <span className="text-[#22B14C] font-bold">+</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? t.auth.onboarding.settingUp : t.auth.onboarding.completeSetup}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}
