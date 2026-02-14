'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import { localText } from '@/lib/translations'

interface ChatbotWidgetProps {
  storefrontSlug: string
  primaryColor: string
  currentProductId?: Id<'products'>
}

interface MessageMetadata {
  type?: 'text' | 'product' | 'order' | 'order_summary' | 'order_confirmed'
  productId?: Id<'products'>
  orderId?: Id<'orders'>
  orderData?: {
    items?: Array<{
      productName: string
      quantity: number
      unitPrice: number
      selectedSize?: string
      selectedColor?: string
    }>
    subtotal?: number
    deliveryFee?: number
    total?: number
    customerName?: string
    wilaya?: string
    orderNumber?: string
    orderId?: string
  }
}

interface Message {
  _id: Id<'chatbotMessages'>
  sender: 'customer' | 'bot' | 'seller'
  content: string
  createdAt: number
  metadata?: MessageMetadata
}

function OrderSummaryCard({
  orderData,
  primaryColor,
  language,
  onConfirm,
  onCancel,
}: {
  orderData: MessageMetadata['orderData']
  primaryColor: string
  language: 'ar' | 'en' | 'fr'
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!orderData) return null

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 mt-2 space-y-2">
      <p className="font-semibold text-sm text-slate-800">
        {localText(language, {
          ar: 'ملخص الطلب',
          en: 'Order Summary',
          fr: 'Résumé de la commande',
        })}
      </p>

      {orderData.items?.map((item, idx) => (
        <div key={idx} className="flex justify-between text-xs text-slate-600">
          <span>
            {item.productName} x{item.quantity}
            {item.selectedSize ? ` (${item.selectedSize})` : ''}
            {item.selectedColor ? ` (${item.selectedColor})` : ''}
          </span>
          <span>{(item.unitPrice * item.quantity).toLocaleString()} {localText(language, { ar: 'دج', en: 'DZD', fr: 'DZD' })}</span>
        </div>
      ))}

      <div className="border-t border-slate-100 pt-1 space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{localText(language, { ar: 'المجموع الفرعي', en: 'Subtotal', fr: 'Sous-total' })}</span>
          <span>{(orderData.subtotal || 0).toLocaleString()} {localText(language, { ar: 'دج', en: 'DZD', fr: 'DZD' })}</span>
        </div>
        {(orderData.deliveryFee ?? 0) > 0 && (
          <div className="flex justify-between text-xs text-slate-500">
            <span>{localText(language, { ar: 'التوصيل', en: 'Delivery', fr: 'Livraison' })}</span>
            <span>{(orderData.deliveryFee || 0).toLocaleString()} {localText(language, { ar: 'دج', en: 'DZD', fr: 'DZD' })}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-semibold text-slate-800">
          <span>{localText(language, { ar: 'الإجمالي', en: 'Total', fr: 'Total' })}</span>
          <span>{(orderData.total || 0).toLocaleString()} {localText(language, { ar: 'دج', en: 'DZD', fr: 'DZD' })}</span>
        </div>
      </div>

      {orderData.customerName && (
        <div className="text-xs text-slate-500">
          {orderData.customerName} - {orderData.wilaya || ''}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onConfirm}
          className="flex-1 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          {localText(language, { ar: 'تأكيد الطلب', en: 'Confirm Order', fr: 'Confirmer' })}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          {localText(language, { ar: 'إلغاء', en: 'Cancel', fr: 'Annuler' })}
        </button>
      </div>
    </div>
  )
}

function OrderConfirmedCard({
  orderData,
  primaryColor,
  language,
  storefrontSlug,
}: {
  orderData: MessageMetadata['orderData']
  primaryColor: string
  language: 'ar' | 'en' | 'fr'
  storefrontSlug: string
}) {
  if (!orderData) return null

  return (
    <div className="bg-white border border-green-200 rounded-xl p-3 mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="font-semibold text-sm text-green-700">
          {localText(language, {
            ar: 'تم تأكيد الطلب!',
            en: 'Order Confirmed!',
            fr: 'Commande confirmée !',
          })}
        </p>
      </div>

      {orderData.orderNumber && (
        <p className="text-xs text-slate-600">
          {localText(language, { ar: 'رقم الطلب', en: 'Order #', fr: 'N° commande' })}: {orderData.orderNumber}
        </p>
      )}

      <p className="text-sm font-semibold text-slate-800">
        {localText(language, { ar: 'الإجمالي', en: 'Total', fr: 'Total' })}: {(orderData.total || 0).toLocaleString()} {localText(language, { ar: 'دج', en: 'DZD', fr: 'DZD' })}
      </p>

      {orderData.orderId && (
        <a
          href={`/${storefrontSlug}/order-success/${orderData.orderId}`}
          className="block text-center py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          {localText(language, { ar: 'تتبع الطلب', en: 'Track Order', fr: 'Suivre la commande' })}
        </a>
      )}
    </div>
  )
}

export default function ChatbotWidget({ storefrontSlug, primaryColor, currentProductId }: ChatbotWidgetProps) {
  const { t, language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [sessionId, setSessionId] = useState<string>('')
  const [conversationId, setConversationId] = useState<Id<'chatbotConversations'> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)

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
    try {
      let id = localStorage.getItem('ma5zani-chat-session')
      if (!id) {
        id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('ma5zani-chat-session', id)
      }
      setSessionId(id)
    } catch {
      // localStorage unavailable, generate in-memory session
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    }
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

  const handleSendMessage = async (directMessage?: string) => {
    const message = directMessage || inputValue.trim()
    if (!message || !conversationId || !sessionId || isSending) return

    if (!directMessage) setInputValue('')
    setIsSending(true)

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
    } finally {
      setIsSending(false)
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

  const handleOrderConfirm = () => {
    const confirmMsg = localText(language, {
      ar: 'نعم، أؤكد الطلب',
      en: 'Yes, confirm the order',
      fr: 'Oui, confirmer la commande',
    })
    handleSendMessage(confirmMsg)
  }

  const handleOrderCancel = () => {
    const cancelMsg = localText(language, {
      ar: 'لا، ألغي الطلب',
      en: 'No, cancel the order',
      fr: 'Non, annuler la commande',
    })
    handleSendMessage(cancelMsg)
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
                  {localText(language, { ar: 'متصل الآن', en: 'Online now', fr: 'En ligne' })}
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
                  {localText(language, { ar: 'جاري التحميل...', en: 'Loading...', fr: 'Chargement...' })}
                </div>
              </div>
            ) : (
              <>
                {messages?.map((msg) => (
                  <div key={msg._id}>
                    <div
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
                            {localText(language, { ar: 'فريق الدعم', en: 'Support Team', fr: 'Equipe support' })}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>

                    {/* Order Summary Card */}
                    {msg.metadata?.type === 'order_summary' && msg.sender === 'bot' && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%]">
                          <OrderSummaryCard
                            orderData={msg.metadata.orderData}
                            primaryColor={primaryColor}
                            language={language}
                            onConfirm={handleOrderConfirm}
                            onCancel={handleOrderCancel}
                          />
                        </div>
                      </div>
                    )}

                    {/* Order Confirmed Card */}
                    {msg.metadata?.type === 'order_confirmed' && msg.sender === 'bot' && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%]">
                          <OrderConfirmedCard
                            orderData={msg.metadata.orderData}
                            primaryColor={primaryColor}
                            language={language}
                            storefrontSlug={storefrontSlug}
                          />
                        </div>
                      </div>
                    )}
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
                disabled={isSending}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isSending}
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
