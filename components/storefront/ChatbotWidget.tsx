'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'

interface ChatbotWidgetProps {
  storefrontSlug: string
  primaryColor: string
  currentProductId?: Id<'products'>
}

interface Message {
  _id: Id<'chatbotMessages'>
  sender: 'customer' | 'bot' | 'seller'
  content: string
  createdAt: number
}

export default function ChatbotWidget({ storefrontSlug, primaryColor, currentProductId }: ChatbotWidgetProps) {
  const { t, language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [sessionId, setSessionId] = useState<string>('')
  const [conversationId, setConversationId] = useState<Id<'chatbotConversations'> | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get chatbot config
  const chatbot = useQuery(api.chatbot.getPublicChatbot, { storefrontSlug })

  // Get conversation messages
  const messages = useQuery(
    api.chatbot.getPublicMessages,
    conversationId && sessionId
      ? { conversationId, sessionId }
      : 'skip'
  ) as Message[] | undefined

  const getOrCreateConversation = useMutation(api.chatbot.getOrCreateConversation)
  const customerSendMessage = useMutation(api.chatbot.customerSendMessage)
  const requestHandoff = useMutation(api.chatbot.requestHandoff)
  const updateContext = useMutation(api.chatbot.updateContext)

  // Generate or retrieve session ID
  useEffect(() => {
    let id = localStorage.getItem('ma5zani-chat-session')
    if (!id) {
      id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('ma5zani-chat-session', id)
    }
    setSessionId(id)
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Update context when product changes
  useEffect(() => {
    if (conversationId && sessionId && currentProductId) {
      updateContext({
        conversationId,
        sessionId,
        context: { currentProductId },
      }).catch(console.error)
    }
  }, [conversationId, sessionId, currentProductId, updateContext])

  // Start conversation when chat opens
  const handleOpenChat = useCallback(async () => {
    setIsOpen(true)

    if (!conversationId && sessionId && chatbot) {
      setIsLoading(true)
      try {
        const convId = await getOrCreateConversation({
          storefrontSlug,
          sessionId,
        })
        setConversationId(convId)
      } catch (error) {
        console.error('Failed to start conversation:', error)
      }
      setIsLoading(false)
    }
  }, [conversationId, sessionId, chatbot, storefrontSlug, getOrCreateConversation])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId || !sessionId) return

    const message = inputValue.trim()
    setInputValue('')

    try {
      // Send customer message to Convex
      await customerSendMessage({
        conversationId,
        content: message,
        sessionId,
      })

      // Generate AI response via API
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          sessionId,
          message,
        }),
      })

      if (!response.ok) {
        console.error('Failed to get AI response')
      }
      // The AI response is saved directly to Convex and will appear via subscription
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleRequestHuman = async () => {
    if (!conversationId || !sessionId) return

    try {
      await requestHandoff({
        conversationId,
        sessionId,
      })
    } catch (error) {
      console.error('Failed to request human:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Don't render if chatbot is not enabled
  if (!chatbot) return null

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-50 w-14 h-14 lg:w-16 lg:h-16 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          style={{ backgroundColor: primaryColor }}
          aria-label={t.chatbot.chatWithUs}
        >
          {/* Chat bubble icon */}
          <svg
            className="w-6 h-6 lg:w-7 lg:h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 lg:bottom-6 lg:right-6 z-50 w-full lg:w-96 h-[100dvh] lg:h-[600px] lg:max-h-[80vh] bg-white lg:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div
            className="p-4 flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">{chatbot.name}</h3>
                <p className="text-white/80 text-xs">
                  {language === 'ar' ? 'متصل الآن' : 'Online now'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1"
              aria-label="Close chat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-slate-400">
                  {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </div>
              </div>
            ) : (
              <>
                {messages?.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${
                      msg.sender === 'customer' ? 'justify-end' :
                      msg.sender === 'bot' || msg.sender === 'seller' ? 'justify-start' : ''
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                        msg.sender === 'customer'
                          ? 'text-white rounded-br-md'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                      }`}
                      style={msg.sender === 'customer' ? { backgroundColor: primaryColor } : undefined}
                    >
                      {msg.sender === 'seller' && (
                        <p className="text-[10px] text-slate-400 mb-1">
                          {language === 'ar' ? 'فريق الدعم' : 'Support Team'}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Talk to Human Button */}
          <div className="px-4 py-2 border-t border-slate-100 bg-white">
            <button
              onClick={handleRequestHuman}
              className="w-full text-center text-sm text-slate-500 hover:text-slate-700 py-1"
            >
              {t.chatbot.talkToHuman}
            </button>
          </div>

          {/* Input */}
          <div className="p-3 lg:p-4 border-t border-slate-200 bg-white safe-area-inset-bottom">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.chatbot.typeMessage}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-full focus:ring-2 focus:border-transparent outline-none text-sm"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: primaryColor }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
