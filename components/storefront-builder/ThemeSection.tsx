'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/LanguageContext';
import { localText } from '@/lib/translations';
import Button from '@/components/ui/Button';

interface ThemeSectionProps {
  storefront: Doc<'storefronts'> | null;
}

const presetColors = [
  { name: 'Blue', primary: '#0054A6', accent: '#F7941D' },
  { name: 'Green', primary: '#22B14C', accent: '#F7941D' },
  { name: 'Purple', primary: '#7C3AED', accent: '#F59E0B' },
  { name: 'Red', primary: '#DC2626', accent: '#FACC15' },
  { name: 'Teal', primary: '#0D9488', accent: '#F97316' },
  { name: 'Indigo', primary: '#4F46E5', accent: '#EC4899' },
];

export default function ThemeSection({ storefront }: ThemeSectionProps) {
  const { language } = useLanguage();

  const [primaryColor, setPrimaryColor] = useState(storefront?.theme?.primaryColor || '#0054A6');
  const [accentColor, setAccentColor] = useState(storefront?.theme?.accentColor || '#F7941D');
  const [saving, setSaving] = useState(false);

  const updateStorefront = useMutation(api.storefronts.updateStorefront);

  useEffect(() => {
    if (storefront?.theme) {
      setPrimaryColor(storefront.theme.primaryColor);
      setAccentColor(storefront.theme.accentColor);
    }
  }, [storefront]);

  const handleSave = async () => {
    if (!storefront) return;

    setSaving(true);
    try {
      await updateStorefront({
        theme: { primaryColor, accentColor },
      });
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset: typeof presetColors[0]) => {
    setPrimaryColor(preset.primary);
    setAccentColor(preset.accent);
  };

  if (!storefront) {
    return (
      <div className="text-center py-8 text-slate-500">
        {localText(language, { ar: 'يرجى إنشاء متجرك أولاً', en: 'Please create your storefront first', fr: 'Veuillez d\'abord créer votre boutique' })}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Presets */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          {localText(language, { ar: 'ألوان جاهزة', en: 'Color Presets', fr: 'Palettes de couleurs' })}
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {presetColors.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="group p-2 rounded-xl border border-slate-200 hover:border-[#0054A6] transition-colors"
            >
              <div className="flex gap-1 mb-1">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: preset.primary }}
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: preset.accent }}
                />
              </div>
              <span className="text-xs text-slate-500 group-hover:text-slate-700">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Color */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {localText(language, { ar: 'اللون الرئيسي', en: 'Primary Color', fr: 'Couleur primaire' })}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-12 h-12 rounded-lg border border-slate-200 cursor-pointer"
          />
          <input
            type="text"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl font-mono text-sm"
            placeholder="#0054A6"
          />
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {localText(language, { ar: 'لون التمييز', en: 'Accent Color', fr: 'Couleur d\'accent' })}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="w-12 h-12 rounded-lg border border-slate-200 cursor-pointer"
          />
          <input
            type="text"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl font-mono text-sm"
            placeholder="#F7941D"
          />
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {localText(language, { ar: 'معاينة', en: 'Preview', fr: 'Aperçu' })}
        </label>
        <div className="p-6 rounded-xl border border-slate-200 bg-slate-50">
          <div
            className="text-xl font-bold mb-2"
            style={{ color: primaryColor }}
          >
            {storefront.boutiqueName}
          </div>
          <p className="text-slate-600 text-sm mb-4">
            {localText(language, { ar: 'وصف المتجر هنا...', en: 'Store description here...', fr: 'Description de la boutique ici...' })}
          </p>
          <button
            className="px-6 py-2 rounded-xl text-white font-medium"
            style={{ backgroundColor: accentColor }}
          >
            {localText(language, { ar: 'تسوق الآن', en: 'Shop Now', fr: 'Acheter maintenant' })}
          </button>
        </div>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving}>
        {saving
          ? localText(language, { ar: 'جاري الحفظ...', en: 'Saving...', fr: 'Enregistrement...' })
          : localText(language, { ar: 'حفظ الألوان', en: 'Save Colors', fr: 'Enregistrer les couleurs' })}
      </Button>
    </div>
  );
}
