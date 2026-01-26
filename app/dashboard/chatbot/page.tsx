'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useLanguage } from '@/lib/LanguageContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

type Personality = 'friendly' | 'professional' | 'casual'

export default function ChatbotPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const chatbot = useQuery(api.chatbot.getChatbot)
  const conversations = useQuery(api.chatbot.getConversations, {})
  const knowledge = useQuery(api.chatbot.getKnowledge, {})
  const upsertChatbot = useMutation(api.chatbot.upsertChatbot)
  const toggleChatbot = useMutation(api.chatbot.toggleChatbot)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    greeting: '',
    personality: 'friendly' as Personality,
    isEnabled: false,
  })

  // Initialize form data when chatbot loads
  useEffect(() => {
    if (chatbot) {
      setFormData({
        name: chatbot.name,
        greeting: chatbot.greeting,
        personality: chatbot.personality,
        isEnabled: chatbot.isEnabled,
      })
    }
  }, [chatbot])

  if (seller === undefined || chatbot === undefined) {
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

  const handleToggle = async () => {
    if (!chatbot) {
      // First time enabling - save with default values
      await handleSave()
    } else {
      await toggleChatbot({ isEnabled: !chatbot.isEnabled })
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await upsertChatbot({
        name: formData.name || (language === 'ar' ? 'مساعد التسوق' : 'Shopping Assistant'),
        greeting: formData.greeting || (language === 'ar' ? 'مرحباً! كيف يمكنني مساعدتك اليوم؟' : 'Hello! How can I help you today?'),
        personality: formData.personality,
        isEnabled: formData.isEnabled || true,
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save chatbot:', error)
    }
    setIsSaving(false)
  }

  // Calculate stats
  const activeChats = conversations?.filter(c => c.status === 'active').length || 0
  const handoffChats = conversations?.filter(c => c.status === 'handoff').length || 0
  const knowledgeCount = knowledge?.length || 0

  const personalityOptions: { value: Personality; label: string }[] = [
    { value: 'friendly', label: t.chatbot.friendly },
    { value: 'professional', label: t.chatbot.professional },
    { value: 'casual', label: t.chatbot.casual },
  ]

  return (
    <DashboardLayout
      seller={seller}
      title={t.chatbot.aiAssistant}
      subtitle={t.chatbot.manageAI}
    >
      <div className="max-w-4xl space-y-4 lg:space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card className="p-3 lg:p-4">
            <p className="text-xs lg:text-sm text-slate-500">{t.chatbot.conversationsToday}</p>
            <p className="text-xl lg:text-2xl font-bold text-[#0054A6]">{activeChats}</p>
          </Card>
          <Card className="p-3 lg:p-4">
            <p className="text-xs lg:text-sm text-slate-500">{t.chatbot.waitingForReply}</p>
            <p className="text-xl lg:text-2xl font-bold text-[#F7941D]">{handoffChats}</p>
          </Card>
          <Card className="p-3 lg:p-4">
            <p className="text-xs lg:text-sm text-slate-500">{t.chatbot.questionsAnswered}</p>
            <p className="text-xl lg:text-2xl font-bold text-[#22B14C]">{knowledgeCount}</p>
          </Card>
          <Card className="p-3 lg:p-4">
            <p className="text-xs lg:text-sm text-slate-500">{t.dashboard.status}</p>
            <p className={`text-xl lg:text-2xl font-bold ${chatbot?.isEnabled ? 'text-[#22B14C]' : 'text-slate-400'}`}>
              {chatbot?.isEnabled ? t.chatbot.enabled : t.chatbot.disabled}
            </p>
          </Card>
        </div>

        {/* Main Settings Card */}
        <Card className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-base lg:text-lg font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
              {t.chatbot.botName}
            </h2>
            {!isEditing && chatbot && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                {t.dashboard.edit}
              </Button>
            )}
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-between p-3 lg:p-4 bg-slate-50 rounded-xl mb-4 lg:mb-6">
            <div>
              <p className="font-medium text-slate-900 text-sm lg:text-base">{t.chatbot.enableChatbot}</p>
              <p className="text-xs lg:text-sm text-slate-500">
                {chatbot?.isEnabled
                  ? (language === 'ar' ? 'المساعد يظهر في متجرك' : 'Assistant is visible on your storefront')
                  : (language === 'ar' ? 'المساعد مخفي عن العملاء' : 'Assistant is hidden from customers')
                }
              </p>
            </div>
            <button
              onClick={handleToggle}
              className={`relative w-12 lg:w-14 h-6 lg:h-7 rounded-full transition-colors ${
                chatbot?.isEnabled ? 'bg-[#22B14C]' : 'bg-slate-300'
              }`}
              style={{ backgroundColor: chatbot?.isEnabled ? '#22B14C' : '#cbd5e1' }}
            >
              <div
                className={`absolute top-0.5 lg:top-1 w-5 lg:w-5 h-5 lg:h-5 rounded-full bg-white shadow transition-transform ${
                  chatbot?.isEnabled
                    ? (language === 'ar' ? 'translate-x-1' : 'translate-x-7 lg:translate-x-8')
                    : (language === 'ar' ? 'translate-x-6 lg:translate-x-8' : 'translate-x-1')
                }`}
              />
            </button>
          </div>

          {/* Settings Form */}
          {(isEditing || !chatbot) ? (
            <div className="space-y-4">
              <Input
                id="botName"
                label={t.chatbot.botName}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.chatbot.botNamePlaceholder}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.chatbot.greeting}
                </label>
                <textarea
                  value={formData.greeting}
                  onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                  placeholder={t.chatbot.greetingPlaceholder}
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none resize-none text-sm lg:text-base"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.chatbot.personality}
                </label>
                <div className="grid grid-cols-3 gap-2 lg:gap-3">
                  {personalityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, personality: option.value })}
                      className={`p-2 lg:p-3 rounded-xl border-2 text-sm lg:text-base transition-all ${
                        formData.personality === option.value
                          ? 'border-[#0054A6] bg-[#0054A6]/5 text-[#0054A6]'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                {chatbot && (
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>
                    {t.dashboard.cancel}
                  </Button>
                )}
                <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? t.dashboard.saving : t.dashboard.save}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">{t.chatbot.botName}</p>
                <p className="font-medium text-slate-900">{chatbot.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">{t.chatbot.greeting}</p>
                <p className="font-medium text-slate-900">{chatbot.greeting}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">{t.chatbot.personality}</p>
                <p className="font-medium text-slate-900">
                  {personalityOptions.find(p => p.value === chatbot.personality)?.label}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
          <Link href="/dashboard/chatbot/training">
            <Card className="p-4 lg:p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <h3 className="font-bold text-slate-900 mb-1 group-hover:text-[#0054A6] transition-colors text-sm lg:text-base">
                {t.chatbot.training}
              </h3>
              <p className="text-xs lg:text-sm text-slate-500">
                {t.chatbot.trainYourBot}
              </p>
            </Card>
          </Link>
          <Link href="/dashboard/chatbot/knowledge">
            <Card className="p-4 lg:p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <h3 className="font-bold text-slate-900 mb-1 group-hover:text-[#0054A6] transition-colors text-sm lg:text-base">
                {t.chatbot.knowledge}
              </h3>
              <p className="text-xs lg:text-sm text-slate-500">
                {knowledgeCount} {language === 'ar' ? 'معلومة' : 'entries'}
              </p>
            </Card>
          </Link>
          <Link href="/dashboard/chatbot/chats">
            <Card className="p-4 lg:p-6 hover:shadow-md transition-shadow cursor-pointer group relative">
              <h3 className="font-bold text-slate-900 mb-1 group-hover:text-[#0054A6] transition-colors text-sm lg:text-base">
                {t.chatbot.liveChats}
              </h3>
              <p className="text-xs lg:text-sm text-slate-500">
                {activeChats + handoffChats} {language === 'ar' ? 'محادثة نشطة' : 'active'}
              </p>
              {handoffChats > 0 && (
                <span className="absolute top-3 lg:top-4 right-3 lg:right-4 w-2 h-2 lg:w-3 lg:h-3 bg-[#F7941D] rounded-full animate-pulse" />
              )}
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
