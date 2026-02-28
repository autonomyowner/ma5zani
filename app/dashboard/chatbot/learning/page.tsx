'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import { localText } from '@/lib/translations'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { sellerHasAccess } from '@/lib/sellerAccess'
import FounderOfferGate from '@/components/dashboard/FounderOfferGate'

interface LearnedEntry {
  _id: Id<'chatbotLearnedKnowledge'>
  question: string
  answer: string
  keywords: string[]
  category: string
  confidence: number
  source: string
  status: string
  createdAt: number
}

interface CustomerProfile {
  _id: Id<'chatbotCustomerProfiles'>
  identifier: string
  channel: string
  name?: string
  wilaya?: string
  orderHistory: { orderId: Id<'orders'>; productName: string; date: number }[]
  interests: string[]
  lastInteraction: number
  createdAt: number
}

export default function LearningPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const chatbot = useQuery(api.chatbot.getChatbot)
  const stats = useQuery(api.chatbotLearning.getLearningStats)
  const pendingLearned = useQuery(api.chatbotLearning.getPendingLearned)
  const customerProfiles = useQuery(api.chatbotLearning.getCustomerProfiles)
  const approveLearned = useMutation(api.chatbotLearning.approveLearned)
  const dismissLearned = useMutation(api.chatbotLearning.dismissLearned)

  const [editingId, setEditingId] = useState<Id<'chatbotLearnedKnowledge'> | null>(null)
  const [editForm, setEditForm] = useState({ question: '', answer: '', keywords: '' })
  const [isProcessing, setIsProcessing] = useState<Id<'chatbotLearnedKnowledge'> | null>(null)

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

  if (seller && !sellerHasAccess(seller)) {
    return (
      <DashboardLayout seller={seller} title={localText(language, { ar: 'التعلم الذكي', en: 'Smart Learning', fr: 'Apprentissage intelligent' })}>
        <FounderOfferGate />
      </DashboardLayout>
    )
  }

  if (chatbot === null) {
    router.push('/dashboard/chatbot')
    return null
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return {
        label: localText(language, { ar: 'ثقة عالية', en: 'High', fr: 'Haute' }),
        className: 'bg-[#22B14C]/10 text-[#22B14C]',
      }
    }
    if (confidence >= 0.5) {
      return {
        label: localText(language, { ar: 'ثقة متوسطة', en: 'Medium', fr: 'Moyenne' }),
        className: 'bg-[#F7941D]/10 text-[#F7941D]',
      }
    }
    return {
      label: localText(language, { ar: 'ثقة منخفضة', en: 'Low', fr: 'Basse' }),
      className: 'bg-slate-100 text-slate-500',
    }
  }

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      shipping: t.chatbot.shipping,
      returns: t.chatbot.returns,
      payment: t.chatbot.payment,
      products: t.chatbot.products,
      general: t.chatbot.general,
    }
    return labels[cat] || cat
  }

  const handleStartEdit = (entry: LearnedEntry) => {
    setEditingId(entry._id)
    setEditForm({
      question: entry.question,
      answer: entry.answer,
      keywords: entry.keywords.join(', '),
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ question: '', answer: '', keywords: '' })
  }

  const handleApprove = async (entry: LearnedEntry) => {
    setIsProcessing(entry._id)
    try {
      if (editingId === entry._id) {
        // Approve with edited values
        const keywords = editForm.keywords
          .split(',')
          .map(k => k.trim().toLowerCase())
          .filter(k => k.length > 0)

        await approveLearned({
          learnedId: entry._id,
          question: editForm.question,
          answer: editForm.answer,
          keywords,
        })
        handleCancelEdit()
      } else {
        // Approve as-is
        await approveLearned({ learnedId: entry._id })
      }
    } catch (error) {
      console.error('Failed to approve:', error)
    }
    setIsProcessing(null)
  }

  const handleDismiss = async (id: Id<'chatbotLearnedKnowledge'>) => {
    setIsProcessing(id)
    try {
      await dismissLearned({ learnedId: id })
    } catch (error) {
      console.error('Failed to dismiss:', error)
    }
    setIsProcessing(null)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const displayedProfiles = (customerProfiles || []).slice(0, 20) as CustomerProfile[]

  return (
    <DashboardLayout
      seller={seller}
      title={localText(language, { ar: 'التعلم الذكي', en: 'Smart Learning', fr: 'Apprentissage intelligent' })}
      subtitle={localText(language, {
        ar: 'المساعد يتعلم تلقائياً من المحادثات الناجحة',
        en: 'Your assistant learns automatically from successful conversations',
        fr: 'Votre assistant apprend automatiquement des conversations reussies',
      })}
      headerActions={
        <Link href="/dashboard/chatbot">
          <Button variant="ghost" size="sm">
            {localText(language, { ar: 'رجوع', en: 'Back', fr: 'Retour' })}
          </Button>
        </Link>
      }
    >
      <div className="max-w-4xl space-y-4 lg:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card className="p-3 lg:p-4">
            <p className="text-xs lg:text-sm text-slate-500">
              {localText(language, { ar: 'اجمالي التعلم', en: 'Total Learned', fr: 'Total appris' })}
            </p>
            <p className="text-xl lg:text-2xl font-bold text-[#0054A6]">{stats?.total || 0}</p>
          </Card>
          <Card className="p-3 lg:p-4">
            <p className="text-xs lg:text-sm text-slate-500">
              {localText(language, { ar: 'بانتظار المراجعة', en: 'Pending Review', fr: 'En attente' })}
            </p>
            <p className="text-xl lg:text-2xl font-bold text-[#F7941D]">{stats?.pending || 0}</p>
          </Card>
          <Card className="p-3 lg:p-4">
            <p className="text-xs lg:text-sm text-slate-500">
              {localText(language, { ar: 'تمت الموافقة', en: 'Approved', fr: 'Approuve' })}
            </p>
            <p className="text-xl lg:text-2xl font-bold text-[#22B14C]">{stats?.approved || 0}</p>
          </Card>
          <Card className="p-3 lg:p-4">
            <p className="text-xs lg:text-sm text-slate-500">
              {localText(language, { ar: 'ملفات العملاء', en: 'Customer Profiles', fr: 'Profils clients' })}
            </p>
            <p className="text-xl lg:text-2xl font-bold text-[#00AEEF]">{stats?.customerProfileCount || 0}</p>
          </Card>
        </div>

        {/* Pending Knowledge Section */}
        <div>
          <h2 className="text-base lg:text-lg font-bold text-[#0054A6] mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>
            {localText(language, { ar: 'معلومات بانتظار المراجعة', en: 'Pending Knowledge Review', fr: 'Connaissances en attente' })}
          </h2>

          {!pendingLearned || pendingLearned.length === 0 ? (
            <Card className="p-6 lg:p-8 text-center">
              <p className="text-slate-500">
                {localText(language, {
                  ar: 'لا توجد معلومات جديدة للمراجعة. سيتعلم المساعد من المحادثات الناجحة تلقائياً.',
                  en: 'No new knowledge to review. The assistant will learn from successful conversations automatically.',
                  fr: 'Aucune nouvelle connaissance. L\'assistant apprendra automatiquement des conversations reussies.',
                })}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {(pendingLearned as LearnedEntry[]).map((entry) => {
                const confidenceBadge = getConfidenceBadge(entry.confidence)
                const isEditing = editingId === entry._id
                const isLoading = isProcessing === entry._id

                return (
                  <Card key={entry._id} className="p-4 lg:p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                          {getCategoryLabel(entry.category)}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${confidenceBadge.className}`}>
                          {confidenceBadge.label}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">
                            {t.chatbot.question}
                          </label>
                          <input
                            type="text"
                            value={editForm.question}
                            onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">
                            {t.chatbot.answer}
                          </label>
                          <textarea
                            value={editForm.answer}
                            onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none resize-none"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">
                            {t.chatbot.keywords}
                          </label>
                          <input
                            type="text"
                            value={editForm.keywords}
                            onChange={(e) => setEditForm({ ...editForm, keywords: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-1 text-sm lg:text-base">{entry.question}</h4>
                        <p className="text-sm text-slate-600 line-clamp-3">{entry.answer}</p>
                        {entry.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.keywords.map((kw, i) => (
                              <span key={i} className="text-xs text-slate-400">
                                #{kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                      {isEditing ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={isLoading}
                          >
                            {t.dashboard.cancel}
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(entry)}
                            disabled={isLoading || !editForm.question.trim() || !editForm.answer.trim()}
                            className="bg-[#22B14C] hover:bg-[#1a9a3e]"
                            style={{ backgroundColor: '#22B14C' }}
                          >
                            {isLoading
                              ? localText(language, { ar: 'جاري...', en: 'Saving...', fr: 'En cours...' })
                              : localText(language, { ar: 'حفظ وموافقة', en: 'Save & Approve', fr: 'Sauvegarder' })}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEdit(entry)}
                            disabled={isLoading}
                          >
                            {t.dashboard.edit}
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(entry)}
                            disabled={isLoading}
                            className="bg-[#22B14C] hover:bg-[#1a9a3e]"
                            style={{ backgroundColor: '#22B14C' }}
                          >
                            {isLoading
                              ? localText(language, { ar: 'جاري...', en: 'Processing...', fr: 'En cours...' })
                              : localText(language, { ar: 'موافقة', en: 'Approve', fr: 'Approuver' })}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismiss(entry._id)}
                            disabled={isLoading}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            {localText(language, { ar: 'رفض', en: 'Dismiss', fr: 'Rejeter' })}
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Customer Profiles Section */}
        <div>
          <h2 className="text-base lg:text-lg font-bold text-[#0054A6] mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>
            {localText(language, { ar: 'ملفات العملاء', en: 'Customer Profiles', fr: 'Profils clients' })}
          </h2>

          {displayedProfiles.length === 0 ? (
            <Card className="p-6 lg:p-8 text-center">
              <p className="text-slate-500">
                {localText(language, {
                  ar: 'لا توجد ملفات عملاء بعد. ستُنشأ تلقائياً عند إتمام الطلبات.',
                  en: 'No customer profiles yet. They are created automatically when orders are completed.',
                  fr: 'Aucun profil client. Ils seront crees automatiquement apres les commandes.',
                })}
              </p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-start p-3 lg:p-4 text-xs font-medium text-slate-500 uppercase">
                        {localText(language, { ar: 'الاسم', en: 'Name', fr: 'Nom' })}
                      </th>
                      <th className="text-start p-3 lg:p-4 text-xs font-medium text-slate-500 uppercase">
                        {localText(language, { ar: 'المعرف', en: 'Identifier', fr: 'Identifiant' })}
                      </th>
                      <th className="text-start p-3 lg:p-4 text-xs font-medium text-slate-500 uppercase hidden sm:table-cell">
                        {localText(language, { ar: 'الولاية', en: 'Wilaya', fr: 'Wilaya' })}
                      </th>
                      <th className="text-start p-3 lg:p-4 text-xs font-medium text-slate-500 uppercase hidden sm:table-cell">
                        {localText(language, { ar: 'الطلبات', en: 'Orders', fr: 'Commandes' })}
                      </th>
                      <th className="text-start p-3 lg:p-4 text-xs font-medium text-slate-500 uppercase hidden lg:table-cell">
                        {localText(language, { ar: 'اخر تفاعل', en: 'Last Seen', fr: 'Dernier contact' })}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedProfiles.map((profile) => (
                      <tr key={profile._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 lg:p-4 text-slate-900 font-medium">
                          {profile.name || localText(language, { ar: 'مجهول', en: 'Anonymous', fr: 'Anonyme' })}
                        </td>
                        <td className="p-3 lg:p-4 text-slate-600">
                          <span className="font-mono text-xs">{profile.identifier.length > 16 ? profile.identifier.slice(0, 16) + '...' : profile.identifier}</span>
                          <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded uppercase">
                            {profile.channel}
                          </span>
                        </td>
                        <td className="p-3 lg:p-4 text-slate-600 hidden sm:table-cell">
                          {profile.wilaya || '-'}
                        </td>
                        <td className="p-3 lg:p-4 text-slate-600 hidden sm:table-cell">
                          {profile.orderHistory.length}
                        </td>
                        <td className="p-3 lg:p-4 text-slate-500 text-xs hidden lg:table-cell">
                          {formatDate(profile.lastInteraction)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
