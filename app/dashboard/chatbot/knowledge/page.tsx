'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

type Category = 'shipping' | 'returns' | 'payment' | 'products' | 'general'

interface KnowledgeEntry {
  _id: Id<'chatbotKnowledge'>
  category: string
  question: string
  answer: string
  keywords: string[]
  createdAt: number
}

export default function KnowledgePage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const chatbot = useQuery(api.chatbot.getChatbot)
  const knowledge = useQuery(api.chatbot.getKnowledge, {})
  const addKnowledge = useMutation(api.chatbot.addKnowledge)
  const updateKnowledge = useMutation(api.chatbot.updateKnowledge)
  const deleteKnowledge = useMutation(api.chatbot.deleteKnowledge)

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<Id<'chatbotKnowledge'> | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const [formData, setFormData] = useState({
    category: 'general' as Category,
    question: '',
    answer: '',
    keywords: '',
  })

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

  if (chatbot === null) {
    router.push('/dashboard/chatbot')
    return null
  }

  const categories: { id: Category | 'all'; label: string }[] = [
    { id: 'all', label: t.dashboard.all },
    { id: 'shipping', label: t.chatbot.shipping },
    { id: 'returns', label: t.chatbot.returns },
    { id: 'payment', label: t.chatbot.payment },
    { id: 'products', label: t.chatbot.products },
    { id: 'general', label: t.chatbot.general },
  ]

  const getCategoryLabel = (cat: string) => {
    const found = categories.find(c => c.id === cat)
    return found?.label || cat
  }

  const filteredKnowledge = knowledge?.filter(k =>
    filterCategory === 'all' || k.category === filterCategory
  ) || []

  const resetForm = () => {
    setFormData({
      category: 'general',
      question: '',
      answer: '',
      keywords: '',
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleEdit = (entry: KnowledgeEntry) => {
    setFormData({
      category: entry.category as Category,
      question: entry.question,
      answer: entry.answer,
      keywords: entry.keywords.join(', '),
    })
    setEditingId(entry._id)
    setIsAdding(false)
  }

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) return

    setIsSaving(true)
    const keywords = formData.keywords
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0)

    try {
      if (editingId) {
        await updateKnowledge({
          knowledgeId: editingId,
          category: formData.category,
          question: formData.question,
          answer: formData.answer,
          keywords,
        })
      } else {
        await addKnowledge({
          category: formData.category,
          question: formData.question,
          answer: formData.answer,
          keywords,
        })
      }
      resetForm()
    } catch (error) {
      console.error('Failed to save:', error)
    }

    setIsSaving(false)
  }

  const handleDelete = async (id: Id<'chatbotKnowledge'>) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete this?')) {
      return
    }

    try {
      await deleteKnowledge({ knowledgeId: id })
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  return (
    <DashboardLayout
      seller={seller}
      title={t.chatbot.knowledge}
      subtitle={language === 'ar' ? 'إدارة قاعدة معرفة المساعد' : 'Manage your assistant\'s knowledge'}
      headerActions={
        <div className="flex gap-2">
          <Link href="/dashboard/chatbot">
            <Button variant="ghost" size="sm">
              {language === 'ar' ? 'رجوع' : 'Back'}
            </Button>
          </Link>
          {!isAdding && !editingId && (
            <Button variant="primary" size="sm" onClick={() => setIsAdding(true)}>
              + {t.chatbot.addKnowledge}
            </Button>
          )}
        </div>
      }
    >
      <div className="max-w-4xl space-y-4 lg:space-y-6">
        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <Card className="p-4 lg:p-6">
            <h3 className="font-bold text-[#0054A6] mb-4" style={{ fontFamily: 'var(--font-outfit)' }}>
              {editingId ? t.chatbot.editKnowledge : t.chatbot.addKnowledge}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.chatbot.category}
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(1).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id as Category })}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        formData.category === cat.id
                          ? 'bg-[#0054A6] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                id="question"
                label={t.chatbot.question}
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder={language === 'ar' ? 'ما هي مدة التوصيل؟' : 'How long does delivery take?'}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.chatbot.answer}
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder={language === 'ar' ? 'التوصيل يستغرق 2-5 أيام حسب الولاية...' : 'Delivery takes 2-5 days depending on the wilaya...'}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none resize-none text-sm lg:text-base"
                  rows={4}
                />
              </div>

              <Input
                id="keywords"
                label={`${t.chatbot.keywords} (${language === 'ar' ? 'مفصولة بفاصلة' : 'comma separated'})`}
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder={language === 'ar' ? 'توصيل, شحن, مدة' : 'delivery, shipping, time'}
              />

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={resetForm}>
                  {t.dashboard.cancel}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={!formData.question.trim() || !formData.answer.trim() || isSaving}
                >
                  {isSaving ? t.dashboard.saving : t.dashboard.save}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const count = cat.id === 'all'
              ? knowledge?.length || 0
              : knowledge?.filter(k => k.category === cat.id).length || 0

            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filterCategory === cat.id
                    ? 'bg-[#0054A6] text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
                <span className="ml-2 opacity-70">({count})</span>
              </button>
            )
          })}
        </div>

        {/* Knowledge List */}
        {filteredKnowledge.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-500 mb-4">{t.chatbot.noKnowledge}</p>
            <Button variant="primary" onClick={() => setIsAdding(true)}>
              + {t.chatbot.addKnowledge}
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredKnowledge.map((entry) => (
              <Card key={entry._id} className="p-4 lg:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                        {getCategoryLabel(entry.category)}
                      </span>
                    </div>
                    <h4 className="font-medium text-slate-900 mb-1">{entry.question}</h4>
                    <p className="text-sm text-slate-600 line-clamp-2">{entry.answer}</p>
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
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                    >
                      {t.dashboard.edit}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry._id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      {t.dashboard.delete}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
