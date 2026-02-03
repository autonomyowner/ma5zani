'use client'

import { useState, useEffect, useCallback } from 'react'
import { getVapiClient, startHoussamCall, endCall, CallStatus, SpeakingStatus } from '@/lib/vapi'

interface VoiceCallButtonProps {
  language: 'ar' | 'en'
  onCallStatusChange?: (isActive: boolean) => void
}

const translations = {
  ar: {
    callWithAI: 'اتصل بحسام',
    connecting: 'جاري الاتصال...',
    endCall: 'إنهاء المكالمة',
    callActive: 'المكالمة نشطة',
    listening: 'يستمع...',
    speaking: 'يتحدث...',
    micPermission: 'يرجى السماح بالوصول للميكروفون',
  },
  en: {
    callWithAI: 'Call Houssam',
    connecting: 'Connecting...',
    endCall: 'End Call',
    callActive: 'Call active',
    listening: 'Listening...',
    speaking: 'Speaking...',
    micPermission: 'Please allow microphone access',
  },
}

export function VoiceCallButton({ language, onCallStatusChange }: VoiceCallButtonProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [speakingStatus, setSpeakingStatus] = useState<SpeakingStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const t = translations[language]

  // Set up Vapi event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return

    const vapi = getVapiClient()

    const handleCallStart = () => {
      setCallStatus('active')
      setSpeakingStatus('idle')
      setError(null)
      onCallStatusChange?.(true)
    }

    const handleCallEnd = () => {
      setCallStatus('idle')
      setSpeakingStatus('idle')
      onCallStatusChange?.(false)
    }

    const handleSpeechStart = () => {
      setSpeakingStatus('speaking')
    }

    const handleSpeechEnd = () => {
      setSpeakingStatus('listening')
    }

    const handleError = (err: Error) => {
      console.error('Vapi error:', err)
      setError(err.message)
      setCallStatus('idle')
      onCallStatusChange?.(false)
    }

    vapi.on('call-start', handleCallStart)
    vapi.on('call-end', handleCallEnd)
    vapi.on('speech-start', handleSpeechStart)
    vapi.on('speech-end', handleSpeechEnd)
    vapi.on('error', handleError)

    return () => {
      vapi.off('call-start', handleCallStart)
      vapi.off('call-end', handleCallEnd)
      vapi.off('speech-start', handleSpeechStart)
      vapi.off('speech-end', handleSpeechEnd)
      vapi.off('error', handleError)
    }
  }, [onCallStatusChange])

  const handleStartCall = useCallback(async () => {
    setError(null)
    setCallStatus('connecting')

    try {
      await startHoussamCall(language)
    } catch (err) {
      console.error('Failed to start call:', err)
      setError(t.micPermission)
      setCallStatus('idle')
      onCallStatusChange?.(false)
    }
  }, [language, t.micPermission, onCallStatusChange])

  const handleEndCall = useCallback(() => {
    setCallStatus('ending')
    endCall()
  }, [])

  // Render different states
  if (callStatus === 'idle') {
    return (
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={handleStartCall}
          className="w-10 h-10 rounded-full bg-[#22B14C] hover:bg-[#1a9040] text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
          title={t.callWithAI}
          aria-label={t.callWithAI}
        >
          {/* Phone icon */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>
        {error && (
          <span className="text-xs text-red-500 max-w-[100px] text-center">{error}</span>
        )}
      </div>
    )
  }

  if (callStatus === 'connecting') {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center animate-pulse">
          {/* Loading dots */}
          <div className="flex gap-0.5">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
        <span className="text-xs text-white/80">{t.connecting}</span>
      </div>
    )
  }

  // Active or ending call
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleEndCall}
        disabled={callStatus === 'ending'}
        className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
        title={t.endCall}
        aria-label={t.endCall}
      >
        {/* Hang up icon */}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
        </svg>
      </button>
      <span className="text-xs text-white/80">
        {callStatus === 'ending' ? '...' : speakingStatus === 'speaking' ? t.speaking : t.listening}
      </span>
    </div>
  )
}
