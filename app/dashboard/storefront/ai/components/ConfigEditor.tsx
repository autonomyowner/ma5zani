'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { localText } from '@/lib/translations';
import { GeneratedConfig } from '@/lib/storefront-ai';
import Button from '@/components/ui/Button';

interface ConfigEditorProps {
  config: GeneratedConfig;
  onConfigChange: (config: GeneratedConfig) => void;
}

type Tab = 'colors' | 'fonts' | 'sections';

export default function ConfigEditor({ config, onConfigChange }: ConfigEditorProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [activeTab, setActiveTab] = useState<Tab>('colors');

  const updateColor = (key: keyof GeneratedConfig['colors'], value: string) => {
    onConfigChange({
      ...config,
      colors: {
        ...config.colors,
        [key]: value,
      },
    });
  };

  const updateFont = (key: keyof GeneratedConfig['fonts'], value: string) => {
    onConfigChange({
      ...config,
      fonts: {
        ...config.fonts,
        [key]: value,
      },
    });
  };

  const toggleSection = (sectionId: string) => {
    onConfigChange({
      ...config,
      sections: config.sections.map((s) =>
        s.id === sectionId ? { ...s, enabled: !s.enabled } : s
      ),
    });
  };

  const reorderSection = (sectionId: string, direction: 'up' | 'down') => {
    const index = config.sections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= config.sections.length) return;

    const newSections = [...config.sections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];

    // Update order values
    newSections.forEach((s, i) => {
      s.order = i;
    });

    onConfigChange({
      ...config,
      sections: newSections,
    });
  };

  const colorLabels = {
    primary: localText(language, { ar: 'اللون الأساسي', en: 'Primary', fr: 'Primaire' }),
    accent: localText(language, { ar: 'لون التمييز', en: 'Accent', fr: 'Accent' }),
    background: localText(language, { ar: 'الخلفية', en: 'Background', fr: 'Arrière-plan' }),
    text: localText(language, { ar: 'النص', en: 'Text', fr: 'Texte' }),
    headerBg: localText(language, { ar: 'خلفية الهيدر', en: 'Header', fr: 'En-tête' }),
    footerBg: localText(language, { ar: 'خلفية الفوتر', en: 'Footer', fr: 'Pied de page' }),
  };

  const fontLabels = {
    display: localText(language, { ar: 'خط العناوين', en: 'Display', fr: 'Affichage' }),
    body: localText(language, { ar: 'خط النص', en: 'Body', fr: 'Corps' }),
    arabic: localText(language, { ar: 'الخط العربي', en: 'Arabic', fr: 'Arabe' }),
  };

  const fontOptions = {
    display: ['Playfair Display', 'Bebas Neue', 'Oswald', 'Abril Fatface', 'Cinzel', 'Lora', 'Cormorant Garamond'],
    body: ['Source Serif Pro', 'Lora', 'Merriweather', 'Libre Baskerville', 'Crimson Text', 'Cormorant'],
    arabic: ['Tajawal', 'Cairo', 'Almarai', 'Amiri', 'Changa', 'El Messiri'],
  };

  const sectionLabels: Record<string, { en: string; ar: string; fr: string }> = {
    hero: { en: 'Hero Banner', ar: 'البانر الرئيسي', fr: 'Bannière principale' },
    announcement: { en: 'Announcement', ar: 'الإعلان', fr: 'Annonce' },
    featured: { en: 'Featured Products', ar: 'منتجات مميزة', fr: 'Produits en vedette' },
    features: { en: 'Features', ar: 'المميزات', fr: 'Caractéristiques' },
    categories: { en: 'Categories', ar: 'التصنيفات', fr: 'Catégories' },
    grid: { en: 'Product Grid', ar: 'شبكة المنتجات', fr: 'Grille de produits' },
    collection: { en: 'Collection', ar: 'المجموعة', fr: 'Collection' },
    newsletter: { en: 'Newsletter', ar: 'النشرة البريدية', fr: 'Newsletter' },
    about: { en: 'About', ar: 'حول', fr: 'À propos' },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-[600px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200">
        <h2 className="font-semibold text-slate-900">
          {localText(language, { ar: 'تعديل التصميم', en: 'Edit Design', fr: 'Modifier le design' })}
        </h2>
        <p className="text-sm text-slate-500">
          {localText(language, { ar: 'عدّل الألوان والخطوط والأقسام', en: 'Customize colors, fonts, and sections', fr: 'Personnalisez les couleurs, polices et sections' })}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        {(['colors', 'fonts', 'sections'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-[#0054A6] text-[#0054A6]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'colors'
              ? localText(language, { ar: 'الألوان', en: 'Colors', fr: 'Couleurs' })
              : tab === 'fonts'
                ? localText(language, { ar: 'الخطوط', en: 'Fonts', fr: 'Polices' })
                : localText(language, { ar: 'الأقسام', en: 'Sections', fr: 'Sections' })}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 mb-4">
              {localText(language, { ar: 'اضغط على أي لون لتغييره', en: 'Click any color to change it', fr: 'Cliquez sur une couleur pour la modifier' })}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(config.colors) as Array<keyof GeneratedConfig['colors']>).map((key) => (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    {colorLabels[key]}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.colors[key]}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="w-10 h-10 rounded border border-slate-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.colors[key]}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm font-mono"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Color Preview */}
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: config.colors.background }}>
              <div
                className="p-3 rounded mb-3"
                style={{ backgroundColor: config.colors.headerBg }}
              >
                <span
                  style={{
                    color:
                      config.colors.headerBg === config.colors.primary
                        ? '#ffffff'
                        : config.colors.primary,
                  }}
                  className="font-semibold"
                >
                  {localText(language, { ar: 'عينة الهيدر', en: 'Header Preview', fr: 'Aperçu de l\'en-tête' })}
                </span>
              </div>
              <p style={{ color: config.colors.text }} className="mb-2">
                {localText(language, { ar: 'هذا نص تجريبي لمعاينة الألوان', en: 'Sample text to preview colors', fr: 'Texte exemple pour prévisualiser les couleurs' })}
              </p>
              <button
                className="px-4 py-2 rounded font-medium"
                style={{ backgroundColor: config.colors.accent, color: '#ffffff' }}
              >
                {localText(language, { ar: 'زر الإجراء', en: 'Action Button', fr: 'Bouton d\'action' })}
              </button>
            </div>
          </div>
        )}

        {/* Fonts Tab */}
        {activeTab === 'fonts' && (
          <div className="space-y-6">
            {(Object.keys(config.fonts) as Array<keyof GeneratedConfig['fonts']>).map((key) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {fontLabels[key]}
                </label>
                <select
                  value={config.fonts[key]}
                  onChange={(e) => updateFont(key, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  {fontOptions[key].map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
                <div
                  className="p-3 bg-slate-50 rounded text-lg"
                  style={{ fontFamily: `'${config.fonts[key]}', sans-serif` }}
                >
                  {key === 'arabic'
                    ? 'نص عربي تجريبي للمعاينة'
                    : 'The quick brown fox jumps over the lazy dog'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sections Tab */}
        {activeTab === 'sections' && (
          <div className="space-y-2">
            <p className="text-sm text-slate-500 mb-4">
              {localText(language, { ar: 'اسحب لإعادة الترتيب، اضغط للتفعيل/الإيقاف', en: 'Drag to reorder, toggle to enable/disable', fr: 'Glissez pour réorganiser, basculez pour activer/désactiver' })}
            </p>
            {config.sections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => (
                <div
                  key={section.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    section.enabled
                      ? 'border-slate-200 bg-white'
                      : 'border-slate-100 bg-slate-50 opacity-60'
                  }`}
                >
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => reorderSection(section.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      {'\u25B2'}
                    </button>
                    <button
                      onClick={() => reorderSection(section.id, 'down')}
                      disabled={index === config.sections.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      {'\u25BC'}
                    </button>
                  </div>

                  {/* Section info */}
                  <div className="flex-1">
                    <span className="font-medium text-slate-900">
                      {sectionLabels[section.type]?.[language] || section.type}
                    </span>
                    {section.content.title && (
                      <p className="text-sm text-slate-500 truncate">
                        {isRTL ? section.content.titleAr : section.content.title}
                      </p>
                    )}
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      section.enabled ? 'bg-[#0054A6]' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        section.enabled
                          ? isRTL
                            ? 'translate-x-0.5'
                            : 'translate-x-6'
                          : isRTL
                            ? 'translate-x-6'
                            : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
        <p className="text-xs text-slate-500 text-center">
          {localText(language, { ar: 'التغييرات ستظهر في المعاينة فوراً', en: 'Changes will appear in preview instantly', fr: 'Les modifications apparaîtront instantanément dans l\'aperçu' })}
        </p>
      </div>
    </div>
  );
}
