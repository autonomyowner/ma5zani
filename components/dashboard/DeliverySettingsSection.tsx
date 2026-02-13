'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useLanguage } from '@/lib/LanguageContext'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { wilayas } from '@/lib/wilayas'

export default function DeliverySettingsSection() {
  const { t } = useLanguage()
  const settings = useQuery(api.delivery.getDeliverySettings)
  const updateSettings = useMutation(api.delivery.updateDeliverySettings)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    apiId: '',
    apiToken: '',
    originWilayaCode: '16',
    isEnabled: false,
    defaultWeight: 1,
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        apiId: settings.apiId || '',
        apiToken: '',  // Don't pre-fill masked token
        originWilayaCode: settings.originWilayaCode || '16',
        isEnabled: settings.isEnabled ?? false,
        defaultWeight: settings.defaultWeight ?? 1,
      })
    }
  }, [settings])

  const handleSave = async () => {
    if (!formData.apiId || !formData.apiToken) return
    setIsSaving(true)
    try {
      await updateSettings({
        apiId: formData.apiId,
        apiToken: formData.apiToken,
        originWilayaCode: formData.originWilayaCode,
        isEnabled: formData.isEnabled,
        defaultWeight: formData.defaultWeight,
      })
      setIsEditing(false)
      setTestResult(null)
    } catch (error) {
      console.error('Failed to save delivery settings:', error)
    }
    setIsSaving(false)
  }

  const handleTest = async () => {
    if (!formData.apiId || !formData.apiToken) return
    setIsTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/delivery/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiId: formData.apiId,
          apiToken: formData.apiToken,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setTestResult({ type: 'success', text: t.dashboard.connectionSuccess })
      } else {
        setTestResult({ type: 'error', text: t.dashboard.connectionFailed })
      }
    } catch {
      setTestResult({ type: 'error', text: t.dashboard.connectionFailed })
    }
    setIsTesting(false)
  }

  const handleEdit = () => {
    if (settings) {
      setFormData({
        apiId: settings.apiId || '',
        apiToken: '',  // User must re-enter token
        originWilayaCode: settings.originWilayaCode || '16',
        isEnabled: settings.isEnabled ?? false,
        defaultWeight: settings.defaultWeight ?? 1,
      })
    }
    setIsEditing(true)
    setTestResult(null)
  }

  return (
    <Card className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h2 className="text-base lg:text-lg font-bold text-[#0054A6]" style={{ fontFamily: 'var(--font-outfit)' }}>
          {t.dashboard.deliverySettings}
        </h2>
        {!isEditing && settings && (
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            {t.dashboard.edit}
          </Button>
        )}
      </div>

      {!settings && !isEditing ? (
        <div className="text-center py-6">
          <p className="text-sm text-slate-500 mb-4">
            Yalidine
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>
            {t.dashboard.deliverySettings}
          </Button>
        </div>
      ) : isEditing ? (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-sm font-medium text-slate-700 mb-1">{t.dashboard.deliveryProvider}</p>
            <p className="text-sm text-slate-500">Yalidine</p>
          </div>

          <Input
            id="yalidine-api-id"
            label={t.dashboard.yalidineApiId}
            value={formData.apiId}
            onChange={(e) => setFormData({ ...formData, apiId: e.target.value })}
            placeholder="ID-XXXXX..."
          />

          <Input
            id="yalidine-api-token"
            type="password"
            label={t.dashboard.yalidineApiToken}
            value={formData.apiToken}
            onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
            placeholder="Token..."
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t.dashboard.originWilaya}
            </label>
            <select
              value={formData.originWilayaCode}
              onChange={(e) => setFormData({ ...formData, originWilayaCode: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0054A6]/20 text-sm"
            >
              {wilayas.filter(w => parseInt(w.code) <= 58).map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            id="yalidine-weight"
            type="number"
            label={t.dashboard.defaultWeight}
            value={String(formData.defaultWeight)}
            onChange={(e) => setFormData({ ...formData, defaultWeight: parseFloat(e.target.value) || 1 })}
            placeholder="1"
          />

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="text-sm font-medium text-slate-700">{t.dashboard.enableDelivery}</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isEnabled: !formData.isEnabled })}
              className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              style={{ backgroundColor: formData.isEnabled ? '#22B14C' : '#cbd5e1' }}
            >
              <span
                className="inline-block h-6 w-6 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
                style={{ transform: formData.isEnabled ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-sm ${
              testResult.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {testResult.text}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setTestResult(null) }}>
              {t.dashboard.cancel}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTest}
              disabled={isTesting || !formData.apiId || !formData.apiToken}
            >
              {isTesting ? '...' : t.dashboard.testConnection}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !formData.apiId || !formData.apiToken}
            >
              {isSaving ? t.dashboard.saving : t.dashboard.saveChanges}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-slate-700">{t.dashboard.deliveryProvider}</p>
              <p className="text-xs text-slate-500">Yalidine</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              settings?.isEnabled ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
            }`}>
              {settings?.isEnabled ? t.dashboard.enabled : t.dashboard.disabled}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">{t.dashboard.yalidineApiId}</p>
              <p className="text-sm font-medium text-slate-700 truncate">{settings?.apiId}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">{t.dashboard.yalidineApiToken}</p>
              <p className="text-sm font-medium text-slate-700">{settings?.apiToken}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">{t.dashboard.originWilaya}</p>
              <p className="text-sm font-medium text-slate-700">
                {wilayas.find(w => w.code === settings?.originWilayaCode)?.name || settings?.originWilayaCode}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">{t.dashboard.defaultWeight}</p>
              <p className="text-sm font-medium text-slate-700">{settings?.defaultWeight ?? 1} kg</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
