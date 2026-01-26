'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useLanguage } from '@/lib/LanguageContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

type ConversationStatus = 'active' | 'handoff' | 'closed'

interface Conversation {
  _id: Id<'chatbotConversations'>
  sessionId: string
  customerName?: string
  customerPhone?: string
  status: ConversationStatus
  lastMessageAt: number
  lastMessage?: string
  messageCount: number
  unreadCount: number
  context?: {
    currentProductId?: Id<'products'>
    cartItems?: string[]
    wilaya?: string
  }
}

interface Message {
  _id: Id<'chatbotMessages'>
  sender: 'customer' | 'bot' | 'seller'
  content: string
  createdAt: number
  metadata?: {
    type?: 'text' | 'product' | 'order'
    productId?: Id<'products'>
    orderId?: Id<'orders'>
  }
}

export default function LiveChatsPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const chatbot = useQuery(api.chatbot.getChatbot)
  const conversations = useQuery(api.chatbot.getConversations, {})

  const [selectedConversation, setSelectedConversation] = useState<Id<'chatbotConversations'> | null>(null)
  const [filterStatus, setFilterStatus] = useState<ConversationStatus | 'all'>('all')
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)

  const messages = useQuery(
    api.chatbot.getConversationMessages,
    selectedConversation ? { conversationId: selectedConversation } : 'skip'
  )

  const takeoverConversation = useMutation(api.chatbot.takeoverConversation)
  const sellerReply = useMutation(api.chatbot.sellerReply)
  const returnToBot = useMutation(api.chatbot.returnToBot)
  const closeConversation = useMutation(api.chatbot.closeConversation)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-select first conversation with handoff status
  useEffect(() => {
    if (!selectedConversation && conversations) {
      const handoff = conversations.find(c => c.status === 'handoff')
      if (handoff) {
        setSelectedConversation(handoff._id)
      } else if (conversations.length > 0) {
        setSelectedConversation(conversations[0]._id)
      }
    }
  }, [conversations, selectedConversation])

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

  const statusFilters: { id: ConversationStatus | 'all'; label: string; color: string }[] = [
    { id: 'all', label: t.dashboard.all, color: 'slate' },
    { id: 'active', label: t.chatbot.activeChats, color: 'green' },
    { id: 'handoff', label: t.chatbot.handoffChats, color: 'orange' },
    { id: 'closed', label: t.chatbot.closedChats, color: 'slate' },
  ]

  const filteredConversations = conversations?.filter(c =>
    filterStatus === 'all' || c.status === filterStatus
  ) || []

  const selectedChat = conversations?.find(c => c._id === selectedConversation)

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return language === 'ar' ? 'الآن' : 'now'
    if (minutes < 60) return `${minutes}${language === 'ar' ? ' د' : 'm'}`
    if (hours < 24) return `${hours}${language === 'ar' ? ' س' : 'h'}`
    return date.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'en-US', { month: 'short', day: 'numeric' })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedConversation) return

    setIsSending(true)
    try {
      await sellerReply({
        conversationId: selectedConversation,
        content: inputValue.trim(),
      })
      setInputValue('')
    } catch (error) {
      console.error('Failed to send:', error)
    }
    setIsSending(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTakeover = async () => {
    if (!selectedConversation) return
    try {
      await takeoverConversation({ conversationId: selectedConversation })
    } catch (error) {
      console.error('Failed to takeover:', error)
    }
  }

  const handleReturnToBot = async () => {
    if (!selectedConversation) return
    try {
      await returnToBot({ conversationId: selectedConversation })
    } catch (error) {
      console.error('Failed to return to bot:', error)
    }
  }

  const handleClose = async () => {
    if (!selectedConversation) return
    if (!confirm(language === 'ar' ? 'هل تريد إغلاق هذه المحادثة؟' : 'Close this conversation?')) return

    try {
      await closeConversation({ conversationId: selectedConversation })
      setSelectedConversation(null)
    } catch (error) {
      console.error('Failed to close:', error)
    }
  }

  return (
    <DashboardLayout
      seller={seller}
      title={t.chatbot.liveChats}
      subtitle={language === 'ar' ? 'إدارة محادثات العملاء' : 'Manage customer conversations'}
      headerActions={
        <Link href="/dashboard/chatbot">
          <Button variant="ghost" size="sm">
            {language === 'ar' ? 'رجوع' : 'Back'}
          </Button>
        </Link>
      }
    >
      <div className="h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)] flex gap-4">
        {/* Conversations List */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col">
          {/* Status Filters */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
            {statusFilters.map((filter) => {
              const count = filter.id === 'all'
                ? conversations?.length || 0
                : conversations?.filter(c => c.status === filter.id).length || 0

              return (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    filterStatus === filter.id
                      ? 'bg-[#0054A6] text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {filter.label}
                  {count > 0 && (
                    <span className="ml-1.5 opacity-70">({count})</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Conversations */}
          <Card className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                {t.chatbot.noChats}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => setSelectedConversation(conv._id)}
                    className={`w-full p-3 lg:p-4 text-left hover:bg-slate-50 transition-colors ${
                      selectedConversation === conv._id ? 'bg-[#0054A6]/5' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 truncate text-sm">
                            {conv.customerName || `${t.chatbot.customer} #${conv.sessionId.slice(0, 6)}`}
                          </span>
                          {conv.status === 'handoff' && (
                            <span className="w-2 h-2 bg-[#F7941D] rounded-full animate-pulse" />
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {conv.lastMessage}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex-shrink-0">
                        {formatTime(conv.lastMessageAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        conv.status === 'active' ? 'bg-green-100 text-green-700' :
                        conv.status === 'handoff' ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {conv.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') :
                         conv.status === 'handoff' ? (language === 'ar' ? 'بانتظار الرد' : 'Waiting') :
                         (language === 'ar' ? 'مغلق' : 'Closed')}
                      </span>
                      {conv.context?.wilaya && (
                        <span className="text-[10px] text-slate-400">
                          {conv.context.wilaya}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Chat View (Desktop) */}
        <Card className="hidden lg:flex flex-1 flex-col overflow-hidden">
          {selectedChat && messages ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">
                    {selectedChat.customerName || `${t.chatbot.customer} #${selectedChat.sessionId.slice(0, 6)}`}
                  </h3>
                  {selectedChat.customerPhone && (
                    <p className="text-sm text-slate-500">{selectedChat.customerPhone}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedChat.status === 'active' && (
                    <Button variant="primary" size="sm" onClick={handleTakeover}>
                      {t.chatbot.takeover}
                    </Button>
                  )}
                  {selectedChat.status === 'handoff' && (
                    <Button variant="ghost" size="sm" onClick={handleReturnToBot}>
                      {t.chatbot.returnToBot}
                    </Button>
                  )}
                  {selectedChat.status !== 'closed' && (
                    <Button variant="ghost" size="sm" onClick={handleClose} className="text-red-500 hover:text-red-600">
                      {t.chatbot.closeChat}
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${
                      msg.sender === 'customer' ? 'justify-start' :
                      msg.sender === 'seller' ? 'justify-end' : 'justify-center'
                    }`}
                  >
                    {msg.sender === 'bot' ? (
                      <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                        {msg.content}
                      </div>
                    ) : (
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                          msg.sender === 'customer'
                            ? 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                            : 'bg-[#0054A6] text-white rounded-br-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${
                          msg.sender === 'customer' ? 'text-slate-400' : 'text-white/70'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-DZ' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {selectedChat.status !== 'closed' && (
                <div className="p-4 border-t border-slate-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={t.chatbot.typeReply}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-full focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none text-sm"
                      disabled={selectedChat.status === 'active'}
                    />
                    <Button
                      variant="primary"
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isSending || selectedChat.status === 'active'}
                      className="rounded-full px-6"
                    >
                      {isSending ? '...' : t.chatbot.send}
                    </Button>
                  </div>
                  {selectedChat.status === 'active' && (
                    <p className="text-xs text-slate-500 mt-2 text-center">
                      {language === 'ar' ? 'انقر "الانضمام" للرد على هذه المحادثة' : 'Click "Join Chat" to reply to this conversation'}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              {language === 'ar' ? 'اختر محادثة للعرض' : 'Select a conversation to view'}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
