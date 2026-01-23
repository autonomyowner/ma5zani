'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { useUser, UserProfile } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { useLanguage } from '@/lib/LanguageContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function SettingsPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { t } = useLanguage()
  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const updateProfile = useMutation(api.sellers.updateSellerProfile)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })

  const plans = [
    { id: 'basic' as const, name: t.dashboard.basicPlan, price: '2,500' },
    { id: 'plus' as const, name: t.dashboard.plusPlan, price: '6,500' },
    { id: 'gros' as const, name: t.dashboard.grosPlan, price: '15,000' },
  ]

  if (!isLoaded || seller === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">{t.dashboard.loading}</div>
      </div>
    )
  }

  if (seller === null && user) {
    router.push('/onboarding')
    return null
  }

  const handleEdit = () => {
    setFormData({
      name: seller?.name || '',
      phone: seller?.phone || '',
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateProfile({
        name: formData.name || undefined,
        phone: formData.phone || undefined,
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
    setIsSaving(false)
  }

  const handlePlanChange = async (plan: 'basic' | 'plus' | 'gros') => {
    if (plan === seller?.plan) return
    if (confirm(`Switch to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan?`)) {
      try {
        await updateProfile({ plan })
      } catch (error) {
        console.error('Failed to change plan:', error)
      }
    }
  }

  return (
    <DashboardLayout
      seller={seller}
      title={t.dashboard.settings}
      subtitle={t.dashboard.manageAccount}
    >
      <div className="max-w-4xl space-y-4 lg:space-y-8">
        {/* Profile Section */}
        <Card className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-base lg:text-lg font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
              {t.dashboard.businessProfile}
            </h2>
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                {t.dashboard.edit}
              </Button>
            )}
          </div>

            {isEditing ? (
              <div className="space-y-4">
                <Input
                  id="name"
                  label={t.dashboard.businessName}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  id="phone"
                  label={t.dashboard.phoneNumber}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+213 555 123 456"
                />
                <div className="flex gap-3 pt-4">
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>
                    {t.dashboard.cancel}
                  </Button>
                  <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? t.dashboard.saving : t.dashboard.saveChanges}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">{t.dashboard.businessName}</p>
                  <p className="font-medium text-slate-900">{seller?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t.dashboard.email}</p>
                  <p className="font-medium text-slate-900">{seller?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t.dashboard.phoneNumber}</p>
                  <p className="font-medium text-slate-900">{seller?.phone || t.dashboard.notSet}</p>
                </div>
              </div>
            )}
          </Card>

        {/* Plan Section */}
        <Card className="p-4 lg:p-6">
          <h2 className="text-base lg:text-lg font-bold text-[#0054A6] mb-4 lg:mb-6" style={{ fontFamily: 'var(--font-outfit)' }}>
            {t.dashboard.subscriptionPlan}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handlePlanChange(plan.id)}
                className={`p-3 lg:p-4 rounded-xl border-2 text-left transition-all ${
                  seller?.plan === plan.id
                    ? 'border-[#0054A6] bg-[#0054A6]/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-sm lg:text-base">{plan.name}</h3>
                  {seller?.plan === plan.id && (
                    <span className="text-[10px] lg:text-xs bg-[#22B14C] text-white px-2 py-0.5 rounded-full">
                      {t.dashboard.current}
                    </span>
                  )}
                </div>
                <p className="text-lg lg:text-xl font-bold text-[#0054A6]">
                  {plan.price} <span className="text-xs lg:text-sm font-normal text-slate-500">{t.dashboard.dzd}/mo</span>
                </p>
              </button>
            ))}
          </div>
        </Card>

        {/* Clerk Profile Management */}
        <Card className="p-4 lg:p-6">
          <h2 className="text-base lg:text-lg font-bold text-[#0054A6] mb-4 lg:mb-6" style={{ fontFamily: 'var(--font-outfit)' }}>
            {t.dashboard.accountSecurity}
          </h2>
          <p className="text-slate-600 mb-4 text-sm lg:text-base">
            {t.dashboard.securityDescription}
          </p>
          <UserProfile
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border border-slate-200 rounded-xl',
              }
            }}
          />
        </Card>
      </div>
    </DashboardLayout>
  )
}
