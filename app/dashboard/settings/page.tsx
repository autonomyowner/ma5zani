'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useLanguage } from '@/lib/LanguageContext'
import { useCurrentSeller } from '@/hooks/useCurrentSeller'
import { authClient } from '@/lib/auth-client'
import { sellerHasAccess } from '@/lib/sellerAccess'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DeliverySettingsSection from '@/components/dashboard/DeliverySettingsSection'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function SettingsPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { seller, session, isLoading, isAuthenticated } = useCurrentSeller()
  const updateProfile = useMutation(api.sellers.updateSellerProfile)
  const toggleEmailNotifications = useMutation(api.sellers.toggleEmailNotifications)

  const [isEditing, setIsEditing] = useState(false)
  const [isTogglingEmail, setIsTogglingEmail] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })

  // Password management state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [hasPassword, setHasPassword] = useState<boolean | null>(null)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const plans = [
    { id: 'basic' as const, name: t.dashboard.basicPlan, price: '2,500' },
    { id: 'plus' as const, name: t.dashboard.plusPlan, price: '6,500' },
    { id: 'gros' as const, name: t.dashboard.grosPlan, price: '15,000' },
  ]

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isLoading, isAuthenticated])

  // Check if user has a password (credential account linked)
  useEffect(() => {
    if (!session) return
    const checkHasPassword = async () => {
      try {
        const res = await fetch('/api/auth/list-accounts', {
          method: 'GET',
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          const accounts = Array.isArray(data) ? data : data?.data || []
          const hasCredential = accounts.some((a: { providerId?: string }) => a.providerId === 'credential')
          setHasPassword(hasCredential)
        } else {
          // If list-accounts fails, default to showing "Set Password"
          setHasPassword(false)
        }
      } catch {
        setHasPassword(false)
      }
    }
    checkHasPassword()
  }, [session])

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

  const handleToggleEmail = async () => {
    setIsTogglingEmail(true)
    try {
      await toggleEmailNotifications({ enabled: !seller?.emailNotifications })
    } catch (error) {
      console.error('Failed to toggle email notifications:', error)
    }
    setIsTogglingEmail(false)
  }

  const handleSetPassword = async () => {
    setPasswordMessage(null)
    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: t.dashboard.passwordTooShort })
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: t.dashboard.passwordMismatch })
      return
    }
    setPasswordLoading(true)
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newPassword: passwordForm.newPassword }),
      })
      if (res.ok) {
        setPasswordMessage({ type: 'success', text: t.dashboard.passwordSet })
        setHasPassword(true)
        setShowPasswordForm(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await res.json().catch(() => null)
        if (data?.message?.includes('already has a password')) {
          setPasswordMessage({ type: 'error', text: t.dashboard.passwordAlreadySet })
          setHasPassword(true)
        } else {
          setPasswordMessage({ type: 'error', text: t.dashboard.passwordSetError })
        }
      }
    } catch {
      setPasswordMessage({ type: 'error', text: t.dashboard.passwordSetError })
    }
    setPasswordLoading(false)
  }

  const handleChangePassword = async () => {
    setPasswordMessage(null)
    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: t.dashboard.passwordTooShort })
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: t.dashboard.passwordMismatch })
      return
    }
    setPasswordLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      if (res.ok) {
        setPasswordMessage({ type: 'success', text: t.dashboard.passwordChanged })
        setShowPasswordForm(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await res.json().catch(() => null)
        if (data?.message?.includes('password') && data?.message?.includes('incorrect')) {
          setPasswordMessage({ type: 'error', text: t.dashboard.currentPasswordWrong })
        } else {
          setPasswordMessage({ type: 'error', text: t.dashboard.changePasswordError })
        }
      }
    } catch {
      setPasswordMessage({ type: 'error', text: t.dashboard.changePasswordError })
    }
    setPasswordLoading(false)
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    window.location.href = '/'
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

        {/* Notifications */}
        <Card className="p-4 lg:p-6">
          <h2 className="text-base lg:text-lg font-bold text-[#0054A6] mb-4 lg:mb-6" style={{ fontFamily: 'var(--font-outfit)' }}>
            {t.dashboard.notifications}
          </h2>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-medium text-slate-900 text-sm lg:text-base">{t.dashboard.emailNotifications}</p>
              <p className="text-xs lg:text-sm text-slate-500 mt-1">{t.dashboard.emailNotificationsDesc}</p>
              <p className="text-xs text-slate-400 mt-1">{seller?.email}</p>
            </div>
            <button
              onClick={handleToggleEmail}
              disabled={isTogglingEmail}
              className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50"
              style={{ backgroundColor: seller?.emailNotifications ? '#22B14C' : '#cbd5e1' }}
            >
              <span
                className="inline-block h-6 w-6 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
                style={{ transform: seller?.emailNotifications ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
          </div>
        </Card>

        {/* Delivery Settings - Only for activated sellers */}
        {seller && sellerHasAccess(seller) && <DeliverySettingsSection />}

        {/* Account Security */}
        <Card className="p-4 lg:p-6">
          <h2 className="text-base lg:text-lg font-bold text-[#0054A6] mb-4 lg:mb-6" style={{ fontFamily: 'var(--font-outfit)' }}>
            {t.dashboard.accountSecurity}
          </h2>
          <p className="text-slate-600 mb-4 text-sm lg:text-base">
            {t.dashboard.securityDescription}
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Email</p>
              <p className="font-medium text-slate-900">{session?.user?.email || seller?.email || '-'}</p>
            </div>

            {/* Password Management */}
            {hasPassword === false && !showPasswordForm && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="font-medium text-slate-900 text-sm lg:text-base mb-1">
                  {t.dashboard.setPasswordTitle}
                </p>
                <p className="text-xs lg:text-sm text-slate-600 mb-3">
                  {t.dashboard.setPasswordDesc}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setShowPasswordForm(true)
                    setPasswordMessage(null)
                  }}
                >
                  {t.dashboard.setPasswordButton}
                </Button>
              </div>
            )}

            {hasPassword === true && !showPasswordForm && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="font-medium text-slate-900 text-sm lg:text-base mb-1">
                  {t.dashboard.changePasswordTitle}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPasswordForm(true)
                    setPasswordMessage(null)
                  }}
                >
                  {t.dashboard.changePasswordButton}
                </Button>
              </div>
            )}

            {showPasswordForm && (
              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <p className="font-medium text-slate-900 text-sm lg:text-base">
                  {hasPassword ? t.dashboard.changePasswordTitle : t.dashboard.setPasswordTitle}
                </p>

                {hasPassword && (
                  <Input
                    id="currentPassword"
                    type="password"
                    label={t.dashboard.currentPassword}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                )}

                <Input
                  id="newPassword"
                  type="password"
                  label={t.dashboard.newPassword}
                  placeholder={t.auth?.signup?.passwordPlaceholder || ''}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />

                <Input
                  id="confirmPassword"
                  type="password"
                  label={t.dashboard.confirmPassword}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowPasswordForm(false)
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      setPasswordMessage(null)
                    }}
                  >
                    {t.dashboard.cancel}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={hasPassword ? handleChangePassword : handleSetPassword}
                    disabled={passwordLoading}
                  >
                    {passwordLoading
                      ? (hasPassword ? t.dashboard.changingPassword : t.dashboard.settingPassword)
                      : (hasPassword ? t.dashboard.changePasswordButton : t.dashboard.setPasswordButton)
                    }
                  </Button>
                </div>
              </div>
            )}

            {passwordMessage && (
              <div className={`p-3 rounded-xl text-sm ${
                passwordMessage.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {passwordMessage.text}
              </div>
            )}

            <Button
              variant="secondary"
              onClick={handleSignOut}
              className="w-full sm:w-auto"
            >
              {t.dashboard.signOut}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
