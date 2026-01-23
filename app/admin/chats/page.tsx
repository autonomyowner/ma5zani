'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

export default function AdminChats() {
  const router = useRouter()
  const [password, setPassword] = useState<string | null>(null)
  const [selectedChatId, setSelectedChatId] = useState<Id<"chats"> | null>(null)
  const [replyText, setReplyText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedPassword = sessionStorage.getItem('adminPassword')
    if (!savedPassword) {
      router.push('/admin')
    } else {
      setPassword(savedPassword)
    }
  }, [router])

  const chats = useQuery(api.chat.getAllChats, password ? { password } : 'skip')
  const messages = useQuery(
    api.chat.getMessagesAdmin,
    password && selectedChatId ? { password, chatId: selectedChatId } : 'skip'
  )

  const adminReply = useMutation(api.chat.adminReply)
  const closeChat = useMutation(api.chat.closeChat)

  const handleLogout = () => {
    sessionStorage.removeItem('adminPassword')
    router.push('/admin')
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedChatId || !password) return

    await adminReply({
      password,
      chatId: selectedChatId,
      content: replyText.trim(),
    })
    setReplyText('')
  }

  const handleCloseChat = async (chatId: Id<"chats">) => {
    if (!password) return
    await closeChat({ password, chatId })
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectedChat = chats?.find(c => c._id === selectedChatId)

  if (!password) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    )
  }

  const isLoading = chats === undefined

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-800 border-r border-slate-700 z-40">
        <div className="h-20 flex items-center px-6 border-b border-slate-700">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="ma5zani" width={40} height={40} className="h-10 w-auto" />
            <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit)' }}>
              Admin
            </span>
          </Link>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <Link href="/admin/dashboard" className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 font-medium">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/sellers" className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 font-medium">
                Sellers
              </Link>
            </li>
            <li>
              <Link href="/admin/storefronts" className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 font-medium">
                Storefronts
              </Link>
            </li>
            <li>
              <Link href="/admin/orders" className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 font-medium">
                All Orders
              </Link>
            </li>
            <li>
              <Link href="/admin/products" className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 font-medium">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/admin/chats" className="block px-4 py-3 rounded-xl bg-[#0054A6] text-white font-medium">
                Support Chats
              </Link>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-red-400 hover:text-red-300 font-medium text-left"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <header className="h-20 bg-slate-800 border-b border-slate-700 flex items-center px-8">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit)' }}>
              Support Chats
            </h1>
            <p className="text-slate-400 text-sm">Manage customer conversations</p>
          </div>
        </header>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Chat List */}
          <div className="w-80 border-r border-slate-700 overflow-y-auto bg-slate-800/50">
            {isLoading && (
              <div className="p-6 text-center text-slate-400">
                <div className="animate-pulse">Loading chats...</div>
              </div>
            )}
            {!isLoading && chats?.length === 0 && (
              <div className="p-6 text-center text-slate-400">
                No chats yet
              </div>
            )}
            {chats && chats.map((chat) => (
              <button
                key={chat._id}
                onClick={() => setSelectedChatId(chat._id)}
                className={`w-full p-4 border-b border-slate-700 text-left hover:bg-slate-700/50 transition-colors ${
                  selectedChatId === chat._id ? 'bg-slate-700' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white">
                    {chat.recipientName || 'Anonymous'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    chat.status === 'open'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-600 text-slate-400'
                  }`}>
                    {chat.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400 truncate">
                  {chat.lastMessage || 'No messages'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(chat.lastMessageAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            {!selectedChatId ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                Select a chat to view messages
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">
                      {selectedChat?.recipientName || 'Anonymous'}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {selectedChat?.recipientEmail || selectedChat?.sessionId}
                    </p>
                  </div>
                  {selectedChat?.status === 'open' && (
                    <button
                      onClick={() => handleCloseChat(selectedChatId)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm"
                    >
                      Close Chat
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages?.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                          msg.sender === 'admin'
                            ? 'bg-[#0054A6] text-white rounded-br-sm'
                            : 'bg-slate-700 text-white rounded-bl-sm'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'admin' ? 'text-blue-200' : 'text-slate-400'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Input */}
                <div className="p-4 bg-slate-800 border-t border-slate-700">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-[#00AEEF] focus:outline-none"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                      className="px-6 py-3 bg-[#F7941D] hover:bg-[#D35400] disabled:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
