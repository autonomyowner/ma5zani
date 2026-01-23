'use client'

import { useState, useRef, useEffect } from 'react'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useLanguage } from '@/lib/LanguageContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AiChat() {
  const { language, dir } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const chat = useAction(api.aiChat.chat)

  const t = {
    ar: {
      title: 'AI مخزني',
      placeholder: 'اكتب سؤالك هنا...',
      send: 'إرسال',
      greeting: 'مرحبا! أنا مساعدك الذكي من مخزني. كيف نقدر نساعدك اليوم؟',
      thinking: 'جاري التفكير...',
    },
    en: {
      title: 'AI Ma5zani',
      placeholder: 'Type your question...',
      send: 'Send',
      greeting: "Hey there! I'm your AI assistant from ma5zani. How can I help you today?",
      thinking: 'Thinking...',
    },
  }

  const texts = t[language]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Initialize with greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: texts.greeting }])
    }
  }, [isOpen, messages.length, texts.greeting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await chat({
        messages: [...messages, userMessage].map(m => ({
          role: m.role,
          content: m.content,
        })),
      })
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: language === 'ar'
          ? 'عذراً، حدث خطأ. حاول مرة أخرى.'
          : 'Sorry, something went wrong. Please try again.'
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-50 w-14 h-14 rounded-full bg-[#0054A6] hover:bg-[#00AEEF] text-white shadow-lg transition-all duration-300 flex items-center justify-center`}
        aria-label="Open AI Chat"
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
            <h3 className="font-semibold text-lg">{texts.title}</h3>
            <p className="text-sm text-white/80">
              {language === 'ar' ? 'مساعدك الذكي' : 'Your smart assistant'}
            </p>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-[#0054A6] text-white rounded-br-sm'
                      : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-500 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 text-sm">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                  </span>
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
                placeholder={texts.placeholder}
                className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 focus:border-[#00AEEF] focus:outline-none text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
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
