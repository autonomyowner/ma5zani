'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useLanguage } from '@/lib/LanguageContext'
import { localText, Language } from '@/lib/translations'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { sellerHasAccess } from '@/lib/sellerAccess'
import FounderOfferGate from '@/components/dashboard/FounderOfferGate'

type Category = 'shipping' | 'returns' | 'payment' | 'products' | 'general'

interface TrainingQuestion {
  id: string
  category: Category
  question: { ar: string; en: string; fr: string }
  keywords: string[]
}

function getTrainingQuestions(): TrainingQuestion[] {
  return [
    // Shipping
    {
      id: 'shipping_time',
      category: 'shipping',
      question: { ar: '\u0643\u0645 \u062a\u0633\u062a\u063a\u0631\u0642 \u0645\u062f\u0629 \u0627\u0644\u062a\u0648\u0635\u064a\u0644\u061f', en: 'How long does delivery take?', fr: 'Combien de temps prend la livraison ?' },
      keywords: ['delivery', 'shipping', 'time', 'how long', 'days'],
    },
    {
      id: 'shipping_cost',
      category: 'shipping',
      question: { ar: '\u0645\u0627 \u0647\u064a \u062a\u0643\u0627\u0644\u064a\u0641 \u0627\u0644\u0634\u062d\u0646\u061f', en: 'What are your shipping costs?', fr: 'Quels sont les frais de livraison ?' },
      keywords: ['shipping', 'cost', 'price', 'delivery', 'fee'],
    },
    {
      id: 'shipping_wilayas',
      category: 'shipping',
      question: { ar: '\u0625\u0644\u0649 \u0623\u064a \u0648\u0644\u0627\u064a\u0627\u062a \u062a\u0648\u0635\u0644\u0648\u0646\u061f', en: 'Which wilayas do you deliver to?', fr: 'Dans quelles wilayas livrez-vous ?' },
      keywords: ['wilayas', 'areas', 'regions', 'deliver', 'cities'],
    },
    // Returns
    {
      id: 'return_policy',
      category: 'returns',
      question: { ar: '\u0645\u0627 \u0647\u064a \u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u0625\u0631\u062c\u0627\u0639\u061f', en: "What's your return policy?", fr: 'Quelle est votre politique de retour ?' },
      keywords: ['return', 'refund', 'exchange', 'policy'],
    },
    {
      id: 'return_time',
      category: 'returns',
      question: { ar: '\u0643\u0645 \u0645\u0646 \u0627\u0644\u0648\u0642\u062a \u0644\u062f\u064a \u0644\u0625\u0631\u062c\u0627\u0639 \u0627\u0644\u0645\u0646\u062a\u062c\u061f', en: 'How long do I have to return an item?', fr: 'Combien de temps ai-je pour retourner un article ?' },
      keywords: ['return', 'time', 'days', 'deadline'],
    },
    // Payment
    {
      id: 'payment_methods',
      category: 'payment',
      question: { ar: '\u0645\u0627 \u0647\u064a \u0637\u0631\u0642 \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u0645\u0642\u0628\u0648\u0644\u0629\u061f', en: 'What payment methods do you accept?', fr: 'Quels modes de paiement acceptez-vous ?' },
      keywords: ['payment', 'pay', 'methods', 'cash', 'card'],
    },
    {
      id: 'payment_cod',
      category: 'payment',
      question: { ar: '\u0647\u0644 \u062a\u0642\u0628\u0644\u0648\u0646 \u0627\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645\u061f', en: 'Do you accept cash on delivery?', fr: 'Acceptez-vous le paiement \u00e0 la livraison ?' },
      keywords: ['cod', 'cash', 'delivery', 'payment'],
    },
    // Products
    {
      id: 'product_quality',
      category: 'products',
      question: { ar: '\u0643\u064a\u0641 \u062a\u0636\u0645\u0646\u0648\u0646 \u062c\u0648\u062f\u0629 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a\u061f', en: 'How do you ensure product quality?', fr: 'Comment assurez-vous la qualit\u00e9 des produits ?' },
      keywords: ['quality', 'guarantee', 'authentic', 'original'],
    },
    {
      id: 'product_availability',
      category: 'products',
      question: { ar: '\u0645\u0627\u0630\u0627 \u0644\u0648 \u0643\u0627\u0646 \u0627\u0644\u0645\u0646\u062a\u062c \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631\u061f', en: 'What if a product is out of stock?', fr: 'Que faire si un produit est en rupture de stock ?' },
      keywords: ['stock', 'available', 'out of stock', 'inventory'],
    },
    // General
    {
      id: 'contact_info',
      category: 'general',
      question: { ar: '\u0643\u064a\u0641 \u064a\u0645\u0643\u0646 \u0644\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0643\u0645\u061f', en: 'How can customers contact you?', fr: 'Comment les clients peuvent-ils vous contacter ?' },
      keywords: ['contact', 'phone', 'email', 'reach'],
    },
    {
      id: 'business_hours',
      category: 'general',
      question: { ar: '\u0645\u0627 \u0647\u064a \u0633\u0627\u0639\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u061f', en: 'What are your business hours?', fr: 'Quels sont vos horaires de travail ?' },
      keywords: ['hours', 'open', 'available', 'time'],
    },
  ]
}

function getQuestionText(q: TrainingQuestion, lang: Language): string {
  return localText(lang, q.question)
}

interface Message {
  id: string
  sender: 'bot' | 'seller'
  content: string
  questionId?: string
  category?: Category
}

export default function TrainingPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const chatbot = useQuery(api.chatbot.getChatbot)
  const knowledge = useQuery(api.chatbot.getKnowledge, {})
  const addKnowledge = useMutation(api.chatbot.addKnowledge)

  const trainingQuestions = getTrainingQuestions()

  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState<TrainingQuestion | null>(null)
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize with existing knowledge
  useEffect(() => {
    if (knowledge) {
      const answered = new Set<string>()
      knowledge.forEach(k => {
        // Try to match with training questions
        trainingQuestions.forEach(q => {
          if (q.keywords.some(kw => k.keywords.includes(kw)) || k.category === q.category) {
            answered.add(q.id)
          }
        })
      })
      setCompletedQuestions(answered)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knowledge])

  // Initialize conversation
  useEffect(() => {
    if (messages.length === 0 && chatbot) {
      const greeting = localText(language, {
        ar: `\u0645\u0631\u062d\u0628\u0627\u064b! \u0623\u0646\u0627 \u0645\u0633\u0627\u0639\u062f\u0643 ${chatbot.name}. \u0633\u0623\u0633\u0627\u0639\u062f\u0643 \u0639\u0644\u0649 \u062a\u062f\u0631\u064a\u0628\u064a \u0644\u0644\u0625\u062c\u0627\u0628\u0629 \u0639\u0644\u0649 \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621. \u0627\u062e\u062a\u0631 \u0645\u0648\u0636\u0648\u0639\u0627\u064b \u0644\u0644\u0628\u062f\u0621.`,
        en: `Hi! I'm your assistant ${chatbot.name}. I'll help you train me to answer customer questions. Choose a topic to start.`,
        fr: `Bonjour ! Je suis votre assistant ${chatbot.name}. Je vais vous aider \u00e0 m'entra\u00eener pour r\u00e9pondre aux questions des clients. Choisissez un sujet pour commencer.`,
      })

      setMessages([{
        id: 'greeting',
        sender: 'bot',
        content: greeting,
      }])
    }
  }, [chatbot, language, messages.length])

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
      <DashboardLayout seller={seller} title={t.chatbot.training}>
        <FounderOfferGate />
      </DashboardLayout>
    )
  }

  if (chatbot === null) {
    router.push('/dashboard/chatbot')
    return null
  }

  const categories: { id: Category; label: string }[] = [
    { id: 'shipping', label: t.chatbot.shipping },
    { id: 'returns', label: t.chatbot.returns },
    { id: 'payment', label: t.chatbot.payment },
    { id: 'products', label: t.chatbot.products },
    { id: 'general', label: t.chatbot.general },
  ]

  const selectCategory = (category: Category) => {
    setSelectedCategory(category)

    // Find unanswered question in this category
    const categoryQuestions = trainingQuestions.filter(q =>
      q.category === category && !completedQuestions.has(q.id)
    )

    if (categoryQuestions.length === 0) {
      // All questions answered in this category
      const message = localText(language, {
        ar: '\u0623\u062d\u0633\u0646\u062a! \u0644\u0642\u062f \u0623\u062c\u0628\u062a \u0639\u0644\u0649 \u062c\u0645\u064a\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645. \u0627\u062e\u062a\u0631 \u0642\u0633\u0645\u0627\u064b \u0622\u062e\u0631 \u0623\u0648 \u0623\u0636\u0641 \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0625\u0636\u0627\u0641\u064a\u0629.',
        en: "Great! You've answered all questions in this section. Choose another topic or add more details.",
        fr: 'Bravo ! Vous avez r\u00e9pondu \u00e0 toutes les questions de cette section. Choisissez un autre sujet ou ajoutez plus de d\u00e9tails.',
      })

      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', content: message }])
      setSelectedCategory(null)
      return
    }

    const question = categoryQuestions[0]
    setCurrentQuestion(question)

    const questionText = getQuestionText(question, language)
    const intro = localText(language, {
      ar: `\u062f\u0639\u0646\u064a \u0623\u0633\u0623\u0644\u0643 \u0639\u0646 ${categories.find(c => c.id === category)?.label}:`,
      en: `Let me ask you about ${categories.find(c => c.id === category)?.label}:`,
      fr: `Laissez-moi vous poser des questions sur ${categories.find(c => c.id === category)?.label} :`,
    })

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), sender: 'bot', content: intro },
      { id: Date.now().toString() + '-q', sender: 'bot', content: questionText, questionId: question.id, category },
    ])
  }

  const handleSubmit = async () => {
    if (!inputValue.trim() || !currentQuestion) return

    const userMessage = inputValue.trim()
    setInputValue('')

    // Add seller's response
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), sender: 'seller', content: userMessage },
    ])

    setIsSaving(true)

    try {
      // Save to knowledge base
      await addKnowledge({
        category: currentQuestion.category,
        question: getQuestionText(currentQuestion, language),
        answer: userMessage,
        keywords: currentQuestion.keywords,
      })

      // Mark as completed
      setCompletedQuestions(prev => new Set([...prev, currentQuestion.id]))

      // Bot confirmation
      const questionDisplay = getQuestionText(currentQuestion, language)
      const answerPreview = `${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}`
      const confirmation = localText(language, {
        ar: `\u0645\u0645\u062a\u0627\u0632! \u0633\u0623\u062a\u0630\u0643\u0631 \u0647\u0630\u0627. \u0639\u0646\u062f\u0645\u0627 \u064a\u0633\u0623\u0644 \u0627\u0644\u0639\u0645\u064a\u0644 \u0639\u0646 "${questionDisplay}"\u060c \u0633\u0623\u0631\u062f: "${answerPreview}"`,
        en: `Perfect! I'll remember that. When a customer asks "${questionDisplay}", I'll respond: "${answerPreview}"`,
        fr: `Parfait ! Je m'en souviendrai. Quand un client demandera "${questionDisplay}", je r\u00e9pondrai : "${answerPreview}"`,
      })

      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), sender: 'bot', content: confirmation },
      ])

      // Ask next question in same category
      const remainingQuestions = trainingQuestions.filter(q =>
        q.category === selectedCategory && !completedQuestions.has(q.id) && q.id !== currentQuestion.id
      )

      if (remainingQuestions.length > 0) {
        const nextQuestion = remainingQuestions[0]
        setCurrentQuestion(nextQuestion)

        const nextText = getQuestionText(nextQuestion, language)
        const nextIntro = localText(language, {
          ar: '\u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u062a\u0627\u0644\u064a:',
          en: 'Next question:',
          fr: 'Question suivante :',
        })

        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            { id: Date.now().toString(), sender: 'bot', content: nextIntro },
            { id: Date.now().toString() + '-q', sender: 'bot', content: nextText, questionId: nextQuestion.id },
          ])
        }, 500)
      } else {
        // Category complete
        setCurrentQuestion(null)
        setSelectedCategory(null)

        const complete = localText(language, {
          ar: '\u0623\u062d\u0633\u0646\u062a! \u0627\u0643\u062a\u0645\u0644\u062a \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645. \u0627\u062e\u062a\u0631 \u0642\u0633\u0645\u0627\u064b \u0622\u062e\u0631 \u0644\u0644\u0645\u062a\u0627\u0628\u0639\u0629.',
          en: "Great job! You've completed this section. Choose another topic to continue.",
          fr: 'Bravo ! Vous avez termin\u00e9 cette section. Choisissez un autre sujet pour continuer.',
        })

        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            { id: Date.now().toString(), sender: 'bot', content: complete },
          ])
        }, 500)
      }
    } catch (error) {
      console.error('Failed to save knowledge:', error)
    }

    setIsSaving(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Calculate progress
  const totalQuestions = trainingQuestions.length
  const answeredQuestions = completedQuestions.size
  const progressPercent = Math.round((answeredQuestions / totalQuestions) * 100)

  return (
    <DashboardLayout
      seller={seller}
      title={t.chatbot.training}
      subtitle={t.chatbot.trainYourBot}
      headerActions={
        <Link href="/dashboard/chatbot">
          <Button variant="ghost" size="sm">
            {localText(language, { ar: '\u0631\u062c\u0648\u0639', en: 'Back', fr: 'Retour' })}
          </Button>
        </Link>
      }
    >
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">{t.chatbot.trainingProgress}</span>
            <span className="text-sm text-slate-500">{answeredQuestions}/{totalQuestions}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#22B14C] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </Card>

        {/* Chat Interface */}
        <Card className="overflow-hidden">
          {/* Messages Area */}
          <div className="h-[400px] lg:h-[500px] overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'seller' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    message.sender === 'seller'
                      ? 'bg-[#0054A6] text-white rounded-br-md'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm lg:text-base whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Category Selection (when no question active) */}
          {!currentQuestion && (
            <div className="p-4 border-t border-slate-200 bg-white">
              <p className="text-sm text-slate-500 mb-3">{t.chatbot.suggestedTopics}</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const categoryQuestions = trainingQuestions.filter(q => q.category === cat.id)
                  const answered = categoryQuestions.filter(q => completedQuestions.has(q.id)).length
                  const isComplete = answered === categoryQuestions.length

                  return (
                    <button
                      key={cat.id}
                      onClick={() => selectCategory(cat.id)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        isComplete
                          ? 'bg-[#22B14C]/10 text-[#22B14C] border border-[#22B14C]/20'
                          : 'bg-[#0054A6]/10 text-[#0054A6] hover:bg-[#0054A6]/20'
                      }`}
                    >
                      {cat.label}
                      <span className="ml-2 text-xs opacity-70">
                        {answered}/{categoryQuestions.length}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Input Area */}
          {currentQuestion && (
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={localText(language, { ar: '\u0627\u0643\u062a\u0628 \u0625\u062c\u0627\u0628\u062a\u0643...', en: 'Type your answer...', fr: 'Tapez votre r\u00e9ponse...' })}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-full focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none text-sm lg:text-base"
                  autoFocus
                />
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={!inputValue.trim() || isSaving}
                  className="rounded-full px-6"
                >
                  {isSaving ? '...' : t.chatbot.send}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Help Text */}
        <p className="text-center text-sm text-slate-500 mt-4">
          {localText(language, {
            ar: '\u0646\u0635\u064a\u062d\u0629: \u0623\u062c\u0628 \u0628\u0627\u0644\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062a\u064a \u062a\u0631\u064a\u062f \u0623\u0646 \u064a\u0631\u062f \u0628\u0647\u0627 \u0645\u0633\u0627\u0639\u062f\u0643 \u0639\u0644\u0649 \u0627\u0644\u0639\u0645\u0644\u0627\u0621',
            en: 'Tip: Answer the way you want your assistant to respond to customers',
            fr: 'Conseil : R\u00e9pondez de la mani\u00e8re dont vous souhaitez que votre assistant r\u00e9ponde aux clients',
          })}
        </p>
      </div>
    </DashboardLayout>
  )
}
