'use client'

// Human support chat - v2 with Vapi AI Voice
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useLanguage } from '@/lib/LanguageContext'
import { Id } from '@/convex/_generated/dataModel'
import { VoiceCallButton } from './VoiceCallButton'

function generateSessionId() {
  return 'chat_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

// Pages where support chat should appear
const ALLOWED_PATHS = [
  '/',           // Home page
  '/dashboard',  // Dashboard and all subpages
  '/login',
  '/signup',
  '/onboarding',
  '/admin',      // Admin pages
]

export function SupportChat() {
  const pathname = usePathname()
  const { language, dir } = useLanguage()

  // Check if support chat should show on this page
  const shouldShow = ALLOWED_PATHS.some(path =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  )

  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [chatId, setChatId] = useState<Id<"chats"> | null>(null)
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const getOrCreateChat = useMutation(api.chat.getOrCreateChat)
  const sendMessage = useMutation(api.chat.sendMessage)
  const existingChat = useQuery(
    api.chat.getChatBySession,
    sessionId ? { sessionId } : 'skip'
  )
  const messages = useQuery(
    api.chat.getMessages,
    chatId ? { chatId } : 'skip'
  )

  const t = {
    ar: {
      title: 'دعم مخزني',
      placeholder: 'اكتب رسالتك هنا...',
      send: 'إرسال',
      greeting: 'مرحبا! كيف يمكننا مساعدتك اليوم؟ فريقنا سيرد عليك في أقرب وقت.',
      waiting: 'في انتظار الرد...',
      online: 'متصل',
      voiceCallActive: 'مكالمة صوتية نشطة...',
    },
    en: {
      title: 'Ma5zani Support',
      placeholder: 'Type your message...',
      send: 'Send',
      greeting: "Hello! How can we help you today? Our team will respond shortly.",
      waiting: 'Waiting for reply...',
      online: 'Online',
      voiceCallActive: 'Voice call active...',
    },
    fr: {
      title: 'Support Ma5zani',
      placeholder: 'Tapez votre message...',
      send: 'Envoyer',
      greeting: "Bonjour ! Comment pouvons-nous vous aider aujourd'hui ? Notre équipe vous répondra dans les plus brefs délais.",
      waiting: 'En attente de réponse...',
      online: 'En ligne',
      voiceCallActive: 'Appel vocal en cours...',
    },
  }

  const texts = t[language]

  // Initialize session ID
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ma5zani-chat-session')
      if (stored) {
        setSessionId(stored)
      } else {
        const newSession = generateSessionId()
        localStorage.setItem('ma5zani-chat-session', newSession)
        setSessionId(newSession)
      }
    } catch {
      // localStorage unavailable
      setSessionId(generateSessionId())
    }
  }, [])

  // Get existing chat if exists
  useEffect(() => {
    if (existingChat) {
      setChatId(existingChat._id)
    }
  }, [existingChat])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !sessionId) return

    const messageContent = input.trim()
    setInput('')

    try {
      // Create chat if doesn't exist
      let currentChatId = chatId
      if (!currentChatId) {
        currentChatId = await getOrCreateChat({ sessionId })
        setChatId(currentChatId)
      }

      // Send message
      await sendMessage({
        chatId: currentChatId,
        content: messageContent,
      })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const hasMessages = messages && messages.length > 0

  // Don't render on storefront pages
  if (!shouldShow) {
    return null
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-50 w-14 h-14 rounded-full bg-[#0054A6] hover:bg-[#00AEEF] text-white shadow-lg transition-all duration-300 flex items-center justify-center`}
        aria-label="Open Support Chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-24 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-50 w-[360px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200`}
          style={{ direction: dir }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0054A6] to-[#00AEEF] p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{texts.title}</h3>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {texts.online}
                </div>
              </div>
              {/* Voice Call Button */}
              <VoiceCallButton
                language={language}
                onCallStatusChange={setIsVoiceCallActive}
              />
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {/* Welcome message */}
            {!hasMessages && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm">
                  {texts.greeting}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages?.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#0054A6] text-white rounded-br-sm'
                      : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Waiting indicator when user has sent but no admin reply yet */}
            {hasMessages && messages[messages.length - 1]?.sender === 'user' && (
              <div className="flex justify-start">
                <div className="px-4 py-2 text-xs text-slate-400 italic">
                  {texts.waiting}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isVoiceCallActive ? texts.voiceCallActive : texts.placeholder}
                disabled={isVoiceCallActive}
                className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 focus:border-[#00AEEF] focus:outline-none text-sm disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isVoiceCallActive}
                className="px-5 py-2.5 bg-[#F7941D] hover:bg-[#D35400] disabled:bg-slate-300 text-white rounded-full text-sm font-medium transition-colors"
              >
                {texts.send}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
