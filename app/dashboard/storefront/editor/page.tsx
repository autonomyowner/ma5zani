'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/lib/LanguageContext';
import { useCurrentSeller } from '@/hooks/useCurrentSeller';
import { getR2PublicUrl } from '@/lib/r2';
import { templates, sectionTypeLabels, availableSectionTypes, getTemplate } from '@/lib/templates';
import { StorefrontSection } from '@/components/storefront/sections';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FounderOfferGate from '@/components/dashboard/FounderOfferGate';

// Generate unique ID for new sections
const generateId = () => `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function StorefrontEditorPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  const { seller, isLoading, isAuthenticated } = useCurrentSeller();
  const storefront = useQuery(api.storefronts.getMyStorefront);

  const updateSections = useMutation(api.storefronts.updateSections);
  const updateColors = useMutation(api.storefronts.updateColors);
  const applyTemplate = useMutation(api.storefronts.applyTemplate);

  // Local state
  const [sections, setSections] = useState<StorefrontSection[]>([]);
  const [colors, setColors] = useState({
    primary: '#0054A6',
    accent: '#F7941D',
    background: '#f8fafc',
    text: '#1e293b',
    headerBg: '#ffffff',
    footerBg: '#ffffff',
  });
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [showAddSection, setShowAddSection] = useState(false);
  const [activeTab, setActiveTab] = useState<'sections' | 'edit' | 'colors'>('sections');

  // Auth protection
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isLoading, isAuthenticated]);

  // Initialize state from storefront data
  useEffect(() => {
    if (storefront) {
      if (storefront.sections && storefront.sections.length > 0) {
        setSections(storefront.sections as StorefrontSection[]);
      } else {
        // Use default template
        const defaultTemplate = getTemplate('shopify');
        setSections(defaultTemplate.sections);
      }

      if (storefront.colors) {
        setColors(storefront.colors);
      } else {
        setColors({
          primary: storefront.theme.primaryColor,
          accent: storefront.theme.accentColor,
          background: '#f8fafc',
          text: '#1e293b',
          headerBg: '#ffffff',
          footerBg: '#ffffff',
        });
      }
    }
  }, [storefront]);

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  const selectSectionMobile = (id: string) => {
    setSelectedSectionId(id);
    setActiveTab('edit');
  };

  // Handle section reordering
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSections.length) return;

    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];

    // Update order numbers
    newSections.forEach((s, i) => {
      s.order = i;
    });

    setSections(newSections);
  };

  // Toggle section enabled state
  const toggleSection = (sectionId: string) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    ));
  };

  // Update section content
  const updateSectionContent = (sectionId: string, field: string, value: unknown) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? { ...s, content: { ...s.content, [field]: value } }
        : s
    ));
  };

  // Add new section
  const addSection = (type: string) => {
    const newSection: StorefrontSection = {
      id: generateId(),
      type,
      order: sections.length,
      enabled: true,
      content: {
        title: sectionTypeLabels[type]?.en || type,
        titleAr: sectionTypeLabels[type]?.ar || type,
      },
    };
    setSections([...sections, newSection]);
    setSelectedSectionId(newSection.id);
    setShowAddSection(false);
  };

  // Delete section
  const deleteSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
  };

  // Apply a template
  const handleApplyTemplate = async (templateId: string) => {
    const template = getTemplate(templateId);
    setSections(template.sections);
    setColors(template.colors);
  };

  // Save changes
  const handleSave = async () => {
    if (!storefront) return;
    setSaving(true);
    try {
      await updateSections({ sections });
      await updateColors({ colors });
      setPreviewKey(prev => prev + 1);
    } catch (error) {
      console.error('Save error:', error);
      alert(isRTL ? 'فشل الحفظ' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Handle image upload for sections
  const handleImageUpload = async (sectionId: string, file: File) => {
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: 'storefront-sections',
        }),
      });

      if (!response.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, key } = await response.json();

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      updateSectionContent(sectionId, 'imageKey', key);
    } catch (error) {
      console.error('Upload error:', error);
      alert(isRTL ? 'فشل رفع الصورة' : 'Failed to upload image');
    }
  };

  if (isLoading || seller === undefined || storefront === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">{t.dashboard.loading}</div>
      </div>
    );
  }

  if (seller === null && isAuthenticated) {
    router.push('/onboarding');
    return null;
  }

  if (seller && !seller.isActivated) {
    return (
      <DashboardLayout seller={seller} title={isRTL ? 'محرر القالب' : 'Template Editor'}>
        <FounderOfferGate />
      </DashboardLayout>
    );
  }

  if (!storefront) {
    router.push('/dashboard/storefront');
    return null;
  }

  return (
    <DashboardLayout
      seller={seller}
      title={isRTL ? 'محرر القالب' : 'Template Editor'}
      subtitle={isRTL ? 'خصص مظهر متجرك' : 'Customize your store appearance'}
      headerActions={
        <div className="flex gap-2">
          <a
            href={`/${storefront.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
          >
            {isRTL ? 'معاينة' : 'Preview'}
          </a>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
          </Button>
        </div>
      }
    >
      {/* ===== MOBILE LAYOUT (<md) ===== */}
      <div className="md:hidden flex flex-col h-[calc(100vh-180px)]">
        {/* Mobile Tab Bar */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-3 flex-shrink-0">
          {([
            { key: 'sections' as const, label: isRTL ? 'الأقسام' : 'Sections' },
            { key: 'edit' as const, label: isRTL ? 'تحرير' : 'Edit' },
            { key: 'colors' as const, label: isRTL ? 'الألوان' : 'Colors' },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-[#0054A6] shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full">
              {/* Template Selector - horizontal scroll */}
              <div className="p-4 border-b border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {isRTL ? 'القوالب' : 'Templates'}
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {Object.values(templates).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleApplyTemplate(template.id)}
                      className="flex-shrink-0 px-3 py-2 text-xs border border-slate-200 rounded-lg hover:border-[#0054A6] hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                    >
                      <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: template.colors.primary }} />
                      <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: template.colors.accent }} />
                      <span>{isRTL ? template.nameAr : template.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sections List */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-700">
                    {isRTL ? 'الأقسام' : 'Sections'}
                  </h3>
                  <button
                    onClick={() => setShowAddSection(!showAddSection)}
                    className="text-xs text-[#0054A6] hover:underline"
                  >
                    {isRTL ? '+ إضافة' : '+ Add'}
                  </button>
                </div>

                {showAddSection && (
                  <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">
                      {isRTL ? 'اختر نوع القسم' : 'Choose section type'}
                    </p>
                    <div className="space-y-1">
                      {availableSectionTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => addSection(type)}
                          className="w-full text-left px-3 py-2.5 text-sm rounded hover:bg-white transition-colors min-h-[44px]"
                        >
                          {isRTL ? sectionTypeLabels[type]?.ar : sectionTypeLabels[type]?.en}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {sections
                    .sort((a, b) => a.order - b.order)
                    .map((section, index) => (
                      <div
                        key={section.id}
                        className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                          selectedSectionId === section.id
                            ? 'border-[#0054A6] bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => selectSectionMobile(section.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); moveSection(index, 'up'); }}
                              disabled={index === 0}
                              className="text-slate-400 hover:text-slate-600 disabled:opacity-30 min-w-[44px] min-h-[22px] flex items-center justify-center"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); moveSection(index, 'down'); }}
                              disabled={index === sections.length - 1}
                              className="text-slate-400 hover:text-slate-600 disabled:opacity-30 min-w-[44px] min-h-[22px] flex items-center justify-center"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>

                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSection(section.id); }}
                            className="w-10 h-5 rounded-full transition-colors flex-shrink-0"
                            style={{ backgroundColor: section.enabled ? '#22c55e' : '#cbd5e1' }}
                          >
                            <span
                              className="block w-4 h-4 bg-white rounded-full transition-transform"
                              style={{
                                transform: section.enabled ? 'translateX(21px)' : 'translateX(2px)',
                              }}
                            />
                          </button>

                          <span className={`flex-1 text-sm truncate ${!section.enabled ? 'opacity-50' : ''}`}>
                            {isRTL ? sectionTypeLabels[section.type]?.ar : sectionTypeLabels[section.type]?.en}
                          </span>

                          <button
                            onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}
                            className="text-slate-400 hover:text-red-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Edit Tab */}
          {activeTab === 'edit' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full">
              {selectedSection ? (
                <>
                  <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('sections')}
                      className="text-slate-400 hover:text-slate-600 min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
                      </svg>
                    </button>
                    <h3 className="font-semibold text-slate-900">
                      {isRTL ? sectionTypeLabels[selectedSection.type]?.ar : sectionTypeLabels[selectedSection.type]?.en}
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <SectionEditor
                      section={selectedSection}
                      onUpdate={(field, value) => updateSectionContent(selectedSection.id, field, value)}
                      onImageUpload={(file) => handleImageUpload(selectedSection.id, file)}
                      isRTL={isRTL}
                      primaryColor={colors.primary}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 p-8">
                  <div className="text-center">
                    <p className="mb-3">{isRTL ? 'اختر قسماً للتحرير' : 'Select a section to edit'}</p>
                    <button
                      onClick={() => setActiveTab('sections')}
                      className="text-sm text-[#0054A6] hover:underline"
                    >
                      {isRTL ? 'عرض الأقسام' : 'View sections'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-medium text-slate-700 mb-4">
                {isRTL ? 'الألوان' : 'Colors'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'primary', label: isRTL ? 'رئيسي' : 'Primary' },
                  { key: 'accent', label: isRTL ? 'ثانوي' : 'Accent' },
                  { key: 'background', label: isRTL ? 'خلفية' : 'Background' },
                  { key: 'text', label: isRTL ? 'نص' : 'Text' },
                  { key: 'headerBg', label: isRTL ? 'رأس الصفحة' : 'Header' },
                  { key: 'footerBg', label: isRTL ? 'تذييل' : 'Footer' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <input
                      type="color"
                      value={colors[key as keyof typeof colors]}
                      onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                      className="w-10 h-10 rounded-lg border cursor-pointer flex-shrink-0"
                    />
                    <span className="text-sm text-slate-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sticky Bottom Bar */}
        <div className="flex-shrink-0 pt-3 flex gap-2">
          <a
            href={`/${storefront.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 text-center font-medium"
          >
            {isRTL ? 'معاينة' : 'Preview'}
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-[#0054A6] text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
          </button>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (md+) ===== */}
      <div className="hidden md:flex gap-6 h-[calc(100vh-180px)]">
        {/* Left Panel - Section List */}
        <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
          {/* Template Selector */}
          <div className="p-4 border-b border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {isRTL ? 'القوالب' : 'Templates'}
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(templates).map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleApplyTemplate(template.id)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg hover:border-[#0054A6] hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: template.colors.primary }} />
                  <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: template.colors.accent }} />
                  <span>{isRTL ? template.nameAr : template.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sections List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-700">
                {isRTL ? 'الأقسام' : 'Sections'}
              </h3>
              <button
                onClick={() => setShowAddSection(!showAddSection)}
                className="text-xs text-[#0054A6] hover:underline"
              >
                {isRTL ? '+ إضافة' : '+ Add'}
              </button>
            </div>

            {/* Add Section Dropdown */}
            {showAddSection && (
              <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 mb-2">
                  {isRTL ? 'اختر نوع القسم' : 'Choose section type'}
                </p>
                <div className="space-y-1">
                  {availableSectionTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => addSection(type)}
                      className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-white transition-colors"
                    >
                      {isRTL ? sectionTypeLabels[type]?.ar : sectionTypeLabels[type]?.en}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Section Items */}
            <div className="space-y-2">
              {sections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <div
                    key={section.id}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                      selectedSectionId === section.id
                        ? 'border-[#0054A6] bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedSectionId(section.id)}
                  >
                    <div className="flex items-center gap-2">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveSection(index, 'up'); }}
                          disabled={index === 0}
                          className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveSection(index, 'down'); }}
                          disabled={index === sections.length - 1}
                          className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Toggle */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSection(section.id); }}
                        className="w-8 h-4 rounded-full transition-colors flex-shrink-0"
                        style={{ backgroundColor: section.enabled ? '#22c55e' : '#cbd5e1' }}
                      >
                        <span
                          className="block w-3 h-3 bg-white rounded-full transition-transform"
                          style={{
                            transform: section.enabled ? 'translateX(17px)' : 'translateX(2px)',
                          }}
                        />
                      </button>

                      {/* Section Name */}
                      <span className={`flex-1 text-sm truncate ${!section.enabled ? 'opacity-50' : ''}`}>
                        {isRTL ? sectionTypeLabels[section.type]?.ar : sectionTypeLabels[section.type]?.en}
                      </span>

                      {/* Delete */}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Colors Section */}
          <div className="p-4 border-t border-slate-100">
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              {isRTL ? 'الألوان' : 'Colors'}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'primary', label: isRTL ? 'رئيسي' : 'Primary' },
                { key: 'accent', label: isRTL ? 'ثانوي' : 'Accent' },
                { key: 'background', label: isRTL ? 'خلفية' : 'Bg' },
              ].map(({ key, label }) => (
                <div key={key} className="text-center">
                  <input
                    type="color"
                    value={colors[key as keyof typeof colors]}
                    onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                    className="w-8 h-8 rounded border cursor-pointer mx-auto block"
                  />
                  <span className="text-[10px] text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Section Editor */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
          {selectedSection ? (
            <>
              {/* Editor Header */}
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">
                  {isRTL ? sectionTypeLabels[selectedSection.type]?.ar : sectionTypeLabels[selectedSection.type]?.en}
                </h3>
              </div>

              {/* Editor Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <SectionEditor
                  section={selectedSection}
                  onUpdate={(field, value) => updateSectionContent(selectedSection.id, field, value)}
                  onImageUpload={(file) => handleImageUpload(selectedSection.id, file)}
                  isRTL={isRTL}
                  primaryColor={colors.primary}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <p>{isRTL ? 'اختر قسماً للتحرير' : 'Select a section to edit'}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Section Editor Component
interface SectionEditorProps {
  section: StorefrontSection;
  onUpdate: (field: string, value: unknown) => void;
  onImageUpload: (file: File) => void;
  isRTL: boolean;
  primaryColor: string;
}

function SectionEditor({ section, onUpdate, onImageUpload, isRTL, primaryColor }: SectionEditorProps) {
  const renderField = (field: string, label: string, labelAr: string, type: 'text' | 'textarea' | 'color' | 'number' = 'text') => {
    const value = section.content[field as keyof typeof section.content] || '';

    return (
      <div key={field} className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {isRTL ? labelAr : label}
        </label>
        {type === 'textarea' ? (
          <textarea
            value={value as string}
            onChange={(e) => onUpdate(field, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0054A6]"
          />
        ) : type === 'color' ? (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={(value as string) || primaryColor}
              onChange={(e) => onUpdate(field, e.target.value)}
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <input
              type="text"
              value={(value as string) || ''}
              onChange={(e) => onUpdate(field, e.target.value)}
              placeholder={primaryColor}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
            />
          </div>
        ) : type === 'number' ? (
          <input
            type="number"
            value={value as number}
            onChange={(e) => onUpdate(field, parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0054A6]"
          />
        ) : (
          <Input
            value={value as string}
            onChange={(e) => onUpdate(field, e.target.value)}
          />
        )}
      </div>
    );
  };

  const renderImageUpload = () => {
    const imageKey = section.content.imageKey;
    const imageUrl = imageKey ? getR2PublicUrl(imageKey) : null;

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {isRTL ? 'صورة الخلفية' : 'Background Image'}
        </label>
        <div className="flex items-start gap-3">
          {imageUrl ? (
            <div className="relative">
              <img src={imageUrl} alt="Section" className="w-24 h-16 object-cover rounded-lg border" />
              <button
                onClick={() => onUpdate('imageKey', '')}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="w-24 h-16 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
              {isRTL ? 'صورة' : 'Image'}
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImageUpload(file);
              }}
              className="hidden"
              id={`image-upload-${section.id}`}
            />
            <label
              htmlFor={`image-upload-${section.id}`}
              className="inline-block px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-200"
            >
              {isRTL ? 'رفع' : 'Upload'}
            </label>
          </div>
        </div>
      </div>
    );
  };

  // Render different fields based on section type
  switch (section.type) {
    case 'hero':
      return (
        <div>
          {renderField('title', 'Title (English)', 'العنوان (إنجليزي)')}
          {renderField('titleAr', 'Title (Arabic)', 'العنوان (عربي)')}
          {renderField('subtitle', 'Subtitle (English)', 'العنوان الفرعي (إنجليزي)', 'textarea')}
          {renderField('subtitleAr', 'Subtitle (Arabic)', 'العنوان الفرعي (عربي)', 'textarea')}
          {renderField('ctaText', 'Button Text (English)', 'نص الزر (إنجليزي)')}
          {renderField('ctaTextAr', 'Button Text (Arabic)', 'نص الزر (عربي)')}
          {renderField('ctaLink', 'Button Link', 'رابط الزر')}
          {renderImageUpload()}
          {renderField('backgroundColor', 'Overlay Color', 'لون الغطاء', 'color')}
          {renderField('textColor', 'Text Color', 'لون النص', 'color')}
        </div>
      );

    case 'announcement':
      return (
        <div>
          {renderField('title', 'Text (English)', 'النص (إنجليزي)')}
          {renderField('titleAr', 'Text (Arabic)', 'النص (عربي)')}
          {renderField('backgroundColor', 'Background Color', 'لون الخلفية', 'color')}
          {renderField('textColor', 'Text Color', 'لون النص', 'color')}
        </div>
      );

    case 'featured':
      return (
        <div>
          {renderField('title', 'Title (English)', 'العنوان (إنجليزي)')}
          {renderField('titleAr', 'Title (Arabic)', 'العنوان (عربي)')}
          {renderField('productCount', 'Number of Products', 'عدد المنتجات', 'number')}
          {renderField('backgroundColor', 'Background Color', 'لون الخلفية', 'color')}
        </div>
      );

    case 'features':
      return (
        <div>
          {renderField('title', 'Title (English)', 'العنوان (إنجليزي)')}
          {renderField('titleAr', 'Title (Arabic)', 'العنوان (عربي)')}
          {renderField('backgroundColor', 'Background Color', 'لون الخلفية', 'color')}
          <p className="text-sm text-slate-500 mt-4">
            {isRTL ? 'سيتم عرض 4 مميزات افتراضية' : 'Default 4 features will be displayed'}
          </p>
        </div>
      );

    case 'grid':
      return (
        <div>
          {renderField('title', 'Title (English)', 'العنوان (إنجليزي)')}
          {renderField('titleAr', 'Title (Arabic)', 'العنوان (عربي)')}
          {renderField('productsPerRow', 'Products Per Row', 'المنتجات في الصف', 'number')}
        </div>
      );

    case 'newsletter':
      return (
        <div>
          {renderField('title', 'Title (English)', 'العنوان (إنجليزي)')}
          {renderField('titleAr', 'Title (Arabic)', 'العنوان (عربي)')}
          {renderField('subtitle', 'Subtitle (English)', 'العنوان الفرعي (إنجليزي)', 'textarea')}
          {renderField('subtitleAr', 'Subtitle (Arabic)', 'العنوان الفرعي (عربي)', 'textarea')}
          {renderField('backgroundColor', 'Background Color', 'لون الخلفية', 'color')}
        </div>
      );

    case 'about':
      return (
        <div>
          {renderField('title', 'Title (English)', 'العنوان (إنجليزي)')}
          {renderField('titleAr', 'Title (Arabic)', 'العنوان (عربي)')}
          {renderField('subtitle', 'Content (English)', 'المحتوى (إنجليزي)', 'textarea')}
          {renderField('subtitleAr', 'Content (Arabic)', 'المحتوى (عربي)', 'textarea')}
          {renderImageUpload()}
        </div>
      );

    case 'categories':
      return (
        <div>
          <p className="text-sm text-slate-500">
            {isRTL ? 'سيتم عرض الأقسام من منتجاتك تلقائياً' : 'Categories from your products will be displayed automatically'}
          </p>
        </div>
      );

    case 'collection':
      return (
        <div>
          {renderField('title', 'Title (English)', 'العنوان (إنجليزي)')}
          {renderField('titleAr', 'Title (Arabic)', 'العنوان (عربي)')}
          <p className="text-sm text-slate-500 mt-4">
            {isRTL ? 'أضف المجموعات من إعدادات المتجر' : 'Add collections from store settings'}
          </p>
        </div>
      );

    default:
      return (
        <div>
          {renderField('title', 'Title (English)', 'العنوان (إنجليزي)')}
          {renderField('titleAr', 'Title (Arabic)', 'العنوان (عربي)')}
        </div>
      );
  }
}
