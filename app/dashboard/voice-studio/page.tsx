'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useLanguage } from '@/lib/LanguageContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { sellerHasAccess } from '@/lib/sellerAccess'
import FounderOfferGate from '@/components/dashboard/FounderOfferGate'
import { getR2PublicUrl } from '@/lib/r2'
import type { Id } from '@/convex/_generated/dataModel'

interface CartesiaVoice {
  id: string
  name: string
  language: string
  description?: string
}

const MAX_CHARS = 5000

export default function VoiceStudioPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const vs = t.voiceStudio
  const seller = useQuery(api.sellers.getCurrentSellerProfile)
  const clips = useQuery(api.voiceClips.listMyClips)
  const todayCount = useQuery(api.voiceClips.getTodayClipCount)
  const saveClip = useMutation(api.voiceClips.saveClip)
  const deleteClipMutation = useMutation(api.voiceClips.deleteClip)

  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [selectedLang, setSelectedLang] = useState<'ar' | 'en' | 'fr'>(language)
  const [voiceId, setVoiceId] = useState('')
  const [voiceName, setVoiceName] = useState('')
  const [speed, setSpeed] = useState(1)
  const [voices, setVoices] = useState<CartesiaVoice[]>([])
  const [loadingVoices, setLoadingVoices] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState('')
  const [generatedAudioKey, setGeneratedAudioKey] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)

  // Fetch voices on mount
  const fetchVoices = useCallback(async () => {
    setLoadingVoices(true)
    try {
      const res = await fetch('/api/voice-studio/voices')
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data?.data || [])
        setVoices(list)
      }
    } catch (e) {
      console.error('Failed to fetch voices:', e)
    }
    setLoadingVoices(false)
  }, [])

  useEffect(() => {
    fetchVoices()
  }, [fetchVoices])

  // Filter voices by selected language
  const filteredVoices = voices.filter((v) => {
    if (!v.language) return false
    return v.language.toLowerCase().startsWith(selectedLang)
  })

  // Reset voice selection when language changes
  useEffect(() => {
    setVoiceId('')
    setVoiceName('')
  }, [selectedLang])

  if (seller === undefined) {
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
      <DashboardLayout seller={seller} title={vs?.title || 'Voice Studio'}>
        <FounderOfferGate />
      </DashboardLayout>
    )
  }

  const handleGenerate = async () => {
    setError('')

    if (!transcript.trim()) {
      setError(vs?.errorTranscriptRequired || 'Text is required')
      return
    }
    if (!voiceId) {
      setError(vs?.errorVoiceRequired || 'Please select a voice')
      return
    }
    if (transcript.length > MAX_CHARS) {
      setError(vs?.errorTooLong || 'Text is too long')
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/voice-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript.trim(),
          voiceId,
          language: selectedLang,
          speed: speed !== 1 ? speed : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Generation failed')
      }

      const { key, publicUrl } = await res.json()
      setGeneratedAudioUrl(publicUrl)
      setGeneratedAudioKey(key)
    } catch (e) {
      setError(vs?.errorGeneration || 'Audio generation failed. Please try again.')
      console.error(e)
    }
    setGenerating(false)
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError(vs?.errorTitleRequired || 'Title is required to save')
      return
    }
    if (!generatedAudioKey) return

    setSaving(true)
    try {
      await saveClip({
        title: title.trim(),
        transcript: transcript.trim(),
        audioKey: generatedAudioKey,
        language: selectedLang,
        voiceId,
        voiceName: voiceName || undefined,
        speed: speed !== 1 ? speed : undefined,
      })
      // Reset form after save
      setGeneratedAudioUrl('')
      setGeneratedAudioKey('')
      setTitle('')
      setTranscript('')
      setError('')
    } catch (e) {
      console.error('Save failed:', e)
    }
    setSaving(false)
  }

  const handleDelete = async (clipId: Id<"voiceClips">) => {
    if (!window.confirm(vs?.confirmDelete || 'Delete this audio clip?')) return
    try {
      await deleteClipMutation({ clipId })
    } catch (e) {
      console.error('Delete failed:', e)
    }
  }

  const handleDownload = (url: string, clipTitle: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `${clipTitle || 'voice-clip'}.mp3`
    a.target = '_blank'
    a.click()
  }

  const langButtons: { key: 'ar' | 'en' | 'fr'; label: string }[] = [
    { key: 'ar', label: vs?.arabic || 'Arabic' },
    { key: 'en', label: vs?.english || 'English' },
    { key: 'fr', label: vs?.french || 'French' },
  ]

  return (
    <DashboardLayout
      seller={seller}
      title={vs?.title || 'Voice Studio'}
      subtitle={vs?.subtitle || 'Convert text to professional AI-generated audio'}
    >
      <div className="max-w-4xl space-y-4 lg:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <Card className="p-3 lg:p-4">
            <p className="text-xs lg:text-sm text-slate-500">{vs?.clipsToday || 'Clips today'}</p>
            <p className="text-xl lg:text-2xl font-bold text-[#0054A6]">{todayCount ?? 0}</p>
          </Card>
          <Card className="p-3 lg:p-4">
            <p className="text-xs lg:text-sm text-slate-500">{vs?.totalClips || 'Total clips'}</p>
            <p className="text-xl lg:text-2xl font-bold text-[#22B14C]">{clips?.length ?? 0}</p>
          </Card>
        </div>

        {/* Generate Form */}
        <Card className="p-4 lg:p-6">
          <h2
            className="text-base lg:text-lg font-bold text-[#0054A6] mb-4 lg:mb-6"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            {vs?.generate || 'Generate Audio'}
          </h2>

          <div className="space-y-4">
            {/* Title */}
            <Input
              id="clipTitle"
              label={vs?.clipTitle || 'Clip title'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={vs?.clipTitlePlaceholder || 'e.g. Product description'}
            />

            {/* Transcript */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {vs?.transcript || 'Text'}
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={vs?.transcriptPlaceholder || 'Type the text you want to convert to audio...'}
                className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none resize-none text-sm lg:text-base"
                rows={6}
                maxLength={MAX_CHARS}
              />
              <p className={`text-xs mt-1 text-right ${transcript.length > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-slate-400'}`}>
                {transcript.length} / {MAX_CHARS} {vs?.characterCount || 'characters'}
              </p>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {vs?.language || 'Language'}
              </label>
              <div className="grid grid-cols-3 gap-2 lg:gap-3">
                {langButtons.map((lb) => (
                  <button
                    key={lb.key}
                    type="button"
                    onClick={() => setSelectedLang(lb.key)}
                    className={`p-2 lg:p-3 rounded-xl border-2 text-sm lg:text-base transition-all ${
                      selectedLang === lb.key
                        ? 'border-[#0054A6] bg-[#0054A6]/5 text-[#0054A6] font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {lb.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {vs?.voice || 'Voice'}
              </label>
              {loadingVoices ? (
                <p className="text-sm text-slate-400 py-2">{vs?.loadingVoices || 'Loading voices...'}</p>
              ) : (
                <select
                  value={voiceId}
                  onChange={(e) => {
                    setVoiceId(e.target.value)
                    const v = filteredVoices.find((v) => v.id === e.target.value)
                    setVoiceName(v?.name || '')
                  }}
                  className="w-full px-3 lg:px-4 py-2.5 lg:py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent outline-none text-sm lg:text-base bg-white"
                >
                  <option value="">{vs?.selectVoice || 'Select a voice'}</option>
                  {filteredVoices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}{v.description ? ` — ${v.description}` : ''}
                    </option>
                  ))}
                </select>
              )}
              {filteredVoices.length === 0 && !loadingVoices && voices.length > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'ar' ? 'لا توجد أصوات لهذه اللغة' : language === 'fr' ? 'Aucune voix pour cette langue' : 'No voices available for this language'}
                </p>
              )}
            </div>

            {/* Speed Slider */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {vs?.speed || 'Speed'}: {speed.toFixed(1)}x
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{vs?.speedSlow || 'Slow'}</span>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="flex-1 accent-[#0054A6]"
                />
                <span className="text-xs text-slate-400">{vs?.speedFast || 'Fast'}</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            {/* Generate Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (vs?.generating || 'Generating...') : (vs?.generate || 'Generate Audio')}
            </Button>
          </div>
        </Card>

        {/* Preview */}
        {generatedAudioUrl && (
          <Card className="p-4 lg:p-6">
            <h2
              className="text-base lg:text-lg font-bold text-[#0054A6] mb-4"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              {vs?.preview || 'Preview'}
            </h2>
            <audio
              ref={audioRef}
              controls
              src={generatedAudioUrl}
              className="w-full mb-4"
            />
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (vs?.saving || 'Saving...') : (vs?.save || 'Save Clip')}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownload(generatedAudioUrl, title || 'voice-clip')}
              >
                {vs?.download || 'Download'}
              </Button>
            </div>
          </Card>
        )}

        {/* My Clips */}
        <Card className="p-4 lg:p-6">
          <h2
            className="text-base lg:text-lg font-bold text-[#0054A6] mb-4 lg:mb-6"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            {vs?.myClips || 'My Clips'}
          </h2>

          {!clips || clips.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              {vs?.noClips || 'No audio clips yet. Create your first one!'}
            </p>
          ) : (
            <div className="space-y-3">
              {clips.map((clip) => (
                <div
                  key={clip._id}
                  className="border border-slate-200 rounded-xl p-3 lg:p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-slate-900 text-sm lg:text-base">
                        {clip.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">
                          {new Date(clip.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-500">
                          {clip.language === 'ar' ? (vs?.arabic || 'Arabic') : clip.language === 'fr' ? (vs?.french || 'French') : (vs?.english || 'English')}
                        </span>
                        {clip.voiceName && (
                          <span className="text-xs text-slate-400">{clip.voiceName}</span>
                        )}
                        {clip.speed && clip.speed !== 1 && (
                          <span className="text-xs text-slate-400">{clip.speed}x</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(getR2PublicUrl(clip.audioKey), clip.title)}
                        className="text-xs text-[#0054A6] hover:underline"
                      >
                        {vs?.download || 'Download'}
                      </button>
                      <button
                        onClick={() => handleDelete(clip._id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        {vs?.delete || 'Delete'}
                      </button>
                    </div>
                  </div>
                  <audio
                    controls
                    src={getR2PublicUrl(clip.audioKey)}
                    className="w-full h-8"
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
