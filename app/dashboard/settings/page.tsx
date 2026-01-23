'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { useUser, UserProfile } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import Sidebar from '@/components/dashboard/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const plans = [
  { id: 'basic' as const, name: 'Basic', price: '2,500' },
  { id: 'plus' as const, name: 'Plus', price: '6,500' },
  { id: 'gros' as const, name: 'Gros', price: '15,000' },
]

export default function SettingsPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const updateProfile = useMutation(api.sellers.updateSellerProfile)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })

  if (!isLoaded || seller === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
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
    <div className="min-h-screen bg-slate-50">
      <Sidebar seller={seller} />

      <main className="ml-64 min-h-screen">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center px-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
              Settings
            </h1>
            <p className="text-slate-500 text-sm">Manage your account and preferences</p>
          </div>
        </header>

        <div className="p-8 max-w-4xl">
          {/* Profile Section */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
                Business Profile
              </h2>
              {!isEditing && (
                <Button variant="ghost" size="sm" onClick={handleEdit}>
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <Input
                  id="name"
                  label="Business Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  id="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+213 555 123 456"
                />
                <div className="flex gap-3 pt-4">
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Business Name</p>
                  <p className="font-medium text-slate-900">{seller?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium text-slate-900">{seller?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-medium text-slate-900">{seller?.phone || 'Not set'}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Plan Section */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-bold text-[#0054A6] mb-6" style={{ fontFamily: 'var(--font-outfit)' }}>
              Subscription Plan
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handlePlanChange(plan.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    seller?.plan === plan.id
                      ? 'border-[#0054A6] bg-[#0054A6]/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900">{plan.name}</h3>
                    {seller?.plan === plan.id && (
                      <span className="text-xs bg-[#22B14C] text-white px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-bold text-[#0054A6]">
                    {plan.price} <span className="text-sm font-normal text-slate-500">DZD/mo</span>
                  </p>
                </button>
              ))}
            </div>
          </Card>

          {/* Clerk Profile Management */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-[#0054A6] mb-6" style={{ fontFamily: 'var(--font-outfit)' }}>
              Account Security
            </h2>
            <p className="text-slate-600 mb-4">
              Manage your email, password, and security settings.
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
      </main>
    </div>
  )
}
