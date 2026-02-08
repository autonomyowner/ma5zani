'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useLanguage } from '@/lib/LanguageContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FounderOfferGate from '@/components/dashboard/FounderOfferGate'

type Category = 'shipping' | 'returns' | 'payment' | 'products' | 'general'

interface TrainingQuestion {
  id: string
  category: Category
  question: string
  questionAr: string
  keywords: string[]
}

const trainingQuestions: TrainingQuestion[] = [
  // Shipping
  {
    id: 'shipping_time',
    category: 'shipping',
    question: 'How long does delivery take?',
    questionAr: 'كم تستغرق مدة التوصيل؟',
    keywords: ['delivery', 'shipping', 'time', 'how long', 'days'],
  },
  {
    id: 'shipping_cost',
    category: 'shipping',
    question: 'What are your shipping costs?',
    questionAr: 'ما هي تكاليف الشحن؟',
    keywords: ['shipping', 'cost', 'price', 'delivery', 'fee'],
  },
  {
    id: 'shipping_wilayas',
    category: 'shipping',
    question: 'Which wilayas do you deliver to?',
    questionAr: 'إلى أي ولايات توصلون؟',
    keywords: ['wilayas', 'areas', 'regions', 'deliver', 'cities'],
  },
  // Returns
  {
    id: 'return_policy',
    category: 'returns',
    question: "What's your return policy?",
    questionAr: 'ما هي سياسة الإرجاع؟',
    keywords: ['return', 'refund', 'exchange', 'policy'],
  },
  {
    id: 'return_time',
    category: 'returns',
    question: 'How long do I have to return an item?',
    questionAr: 'كم من الوقت لدي لإرجاع المنتج؟',
    keywords: ['return', 'time', 'days', 'deadline'],
  },
  // Payment
  {
    id: 'payment_methods',
    category: 'payment',
    question: 'What payment methods do you accept?',
    questionAr: 'ما هي طرق الدفع المقبولة؟',
    keywords: ['payment', 'pay', 'methods', 'cash', 'card'],
  },
  {
    id: 'payment_cod',
    category: 'payment',
    question: 'Do you accept cash on delivery?',
    questionAr: 'هل تقبلون الدفع عند الاستلام؟',
    keywords: ['cod', 'cash', 'delivery', 'payment'],
  },
  // Products
  {
    id: 'product_quality',
    category: 'products',
    question: 'How do you ensure product quality?',
    questionAr: 'كيف تضمنون جودة المنتجات؟',
    keywords: ['quality', 'guarantee', 'authentic', 'original'],
  },
  {
    id: 'product_availability',
    category: 'products',
    question: 'What if a product is out of stock?',
    questionAr: 'ماذا لو كان المنتج غير متوفر؟',
    keywords: ['stock', 'available', 'out of stock', 'inventory'],
  },
  // General
  {
    id: 'contact_info',
    category: 'general',
    question: 'How can customers contact you?',
    questionAr: 'كيف يمكن للعملاء التواصل معكم؟',
    keywords: ['contact', 'phone', 'email', 'reach'],
  },
  {
    id: 'business_hours',
    category: 'general',
    question: 'What are your business hours?',
    questionAr: 'ما هي ساعات العمل؟',
    keywords: ['hours', 'open', 'available', 'time'],
  },
]

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
  }, [knowledge])

  // Initialize conversation
  useEffect(() => {
    if (messages.length === 0 && chatbot) {
      const greeting = language === 'ar'
        ? `مرحباً! أنا مساعدك ${chatbot.name}. سأساعدك على تدريبي للإجابة على أسئلة العملاء. اختر موضوعاً للبدء.`
        : `Hi! I'm your assistant ${chatbot.name}. I'll help you train me to answer customer questions. Choose a topic to start.`

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

  if (seller && !seller.isActivated) {
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
      const message = language === 'ar'
        ? `أحسنت! لقد أجبت على جميع الأسئلة في هذا القسم. اختر قسماً آخر أو أضف معلومات إضافية.`
        : `Great! You've answered all questions in this section. Choose another topic or add more details.`

      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', content: message }])
      setSelectedCategory(null)
      return
    }

    const question = categoryQuestions[0]
    setCurrentQuestion(question)

    const questionText = language === 'ar' ? question.questionAr : question.question
    const intro = language === 'ar'
      ? `دعني أسألك عن ${categories.find(c => c.id === category)?.label}:`
      : `Let me ask you about ${categories.find(c => c.id === category)?.label}:`

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
        question: language === 'ar' ? currentQuestion.questionAr : currentQuestion.question,
        answer: userMessage,
        keywords: currentQuestion.keywords,
      })

      // Mark as completed
      setCompletedQuestions(prev => new Set([...prev, currentQuestion.id]))

      // Bot confirmation
      const confirmation = language === 'ar'
        ? `ممتاز! سأتذكر هذا. عندما يسأل العميل عن "${currentQuestion.questionAr}"، سأرد: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"`
        : `Perfect! I'll remember that. When a customer asks "${currentQuestion.question}", I'll respond: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"`

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

        const nextText = language === 'ar' ? nextQuestion.questionAr : nextQuestion.question
        const nextIntro = language === 'ar' ? 'السؤال التالي:' : 'Next question:'

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

        const complete = language === 'ar'
          ? 'أحسنت! اكتملت الأسئلة في هذا القسم. اختر قسماً آخر للمتابعة.'
          : "Great job! You've completed this section. Choose another topic to continue."

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
            {language === 'ar' ? 'رجوع' : 'Back'}
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
                  placeholder={language === 'ar' ? 'اكتب إجابتك...' : 'Type your answer...'}
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
          {language === 'ar'
            ? 'نصيحة: أجب بالطريقة التي تريد أن يرد بها مساعدك على العملاء'
            : 'Tip: Answer the way you want your assistant to respond to customers'}
        </p>
      </div>
    </DashboardLayout>
  )
}
