'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/lib/LanguageContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import ChatInterface from './components/ChatInterface';
import LivePreview from './components/LivePreview';
import ConfigEditor from './components/ConfigEditor';
import { GeneratedConfig } from '@/lib/storefront-ai';

type Tab = 'chat' | 'preview' | 'edit';

export default function AIStorefrontBuilderPage() {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';

  const seller = useQuery(api.sellers.getCurrentSellerProfile);
  const storefront = useQuery(api.storefronts.getMyStorefront);
  const updateSections = useMutation(api.storefronts.updateSections);
  const updateColors = useMutation(api.storefronts.updateColors);
  const updateFonts = useMutation(api.storefronts.updateFonts);

  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [generatedConfig, setGeneratedConfig] = useState<GeneratedConfig | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  // Handle AI generation
  const handleGenerate = async (prompt: string) => {
    if (!seller?._id) return;

    setIsGenerating(true);
    setError(null);

    // Add user message to history
    setConversationHistory((prev) => [...prev, { role: 'user', content: prompt }]);

    try {
      const response = await fetch('/api/storefront/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          sellerId: seller._id,
          previousConfig: generatedConfig,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate design');
      }

      setGeneratedConfig(data.config);
      setActiveTab('preview');

      // Add assistant response to history
      const summary = `${isRTL ? 'تم إنشاء تصميم جديد:' : 'Generated new design:'} ${data.config.aestheticDirection}`;
      setConversationHistory((prev) => [...prev, { role: 'assistant', content: summary }]);

      if (data.warnings && data.warnings.length > 0) {
        console.warn('AI generation warnings:', data.warnings);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setConversationHistory((prev) => [
        ...prev,
        { role: 'assistant', content: isRTL ? `خطأ: ${message}` : `Error: ${message}` },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Apply the generated config to the storefront
  const handleApply = async () => {
    if (!generatedConfig || !storefront) return;

    setIsSaving(true);
    setError(null);

    try {
      // Update sections
      await updateSections({
        sections: generatedConfig.sections.map((section) => ({
          id: section.id,
          type: section.type,
          order: section.order,
          enabled: section.enabled,
          content: section.content,
        })),
      });

      // Update colors
      await updateColors({
        colors: generatedConfig.colors,
      });

      // Update fonts
      await updateFonts({
        fonts: generatedConfig.fonts,
        aestheticDirection: generatedConfig.aestheticDirection,
      });

      // Show success
      const successMsg = isRTL ? 'تم تطبيق التصميم بنجاح!' : 'Design applied successfully!';
      setConversationHistory((prev) => [...prev, { role: 'assistant', content: successMsg }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to apply design';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset and start over
  const handleReset = () => {
    setGeneratedConfig(null);
    setConversationHistory([]);
    setError(null);
    setActiveTab('chat');
  };

  const pageTitle = isRTL ? 'مصمم المتجر بالذكاء الاصطناعي' : 'AI Store Designer';

  if (!storefront) {
    return (
      <DashboardLayout seller={seller} title={pageTitle}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              {isRTL ? 'يرجى إنشاء متجر أولاً' : 'Please create a storefront first'}
            </h2>
            <p className="text-slate-500 mb-4">
              {isRTL
                ? 'يجب أن يكون لديك متجر لاستخدام مصمم الذكاء الاصطناعي'
                : 'You need a storefront to use the AI designer'}
            </p>
            <a
              href="/dashboard/storefront"
              className="inline-flex items-center justify-center px-4 py-2 bg-[#F7941D] text-white rounded-lg hover:bg-[#D35400] transition-colors"
            >
              {isRTL ? 'إنشاء متجر' : 'Create Storefront'}
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout seller={seller} title={pageTitle}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-outfit)' }}>
              {isRTL ? 'مصمم المتجر بالذكاء الاصطناعي' : 'AI Store Designer'}
            </h1>
            <p className="text-slate-500 mt-1">
              {isRTL
                ? 'صِف متجرك ودع الذكاء الاصطناعي يصمم لك'
                : 'Describe your store and let AI design it for you'}
            </p>
          </div>

          {generatedConfig && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                {isRTL ? 'إعادة' : 'Reset'}
              </Button>
              <Button onClick={handleApply} disabled={isSaving || isGenerating}>
                {isSaving
                  ? isRTL
                    ? 'جاري التطبيق...'
                    : 'Applying...'
                  : isRTL
                    ? 'تطبيق التصميم'
                    : 'Apply Design'}
              </Button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tab Navigation - Mobile */}
        <div className="lg:hidden flex bg-slate-100 rounded-lg p-1">
          {(['chat', 'preview', 'edit'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'chat'
                ? isRTL
                  ? 'المحادثة'
                  : 'Chat'
                : tab === 'preview'
                  ? isRTL
                    ? 'المعاينة'
                    : 'Preview'
                  : isRTL
                    ? 'التعديل'
                    : 'Edit'}
            </button>
          ))}
        </div>

        {/* Main Content - Split View on Desktop */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Chat */}
          <div className={`${activeTab !== 'chat' ? 'hidden lg:block' : ''}`}>
            <ChatInterface
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              conversationHistory={conversationHistory}
              generatedConfig={generatedConfig}
            />
          </div>

          {/* Right Panel - Preview or Editor */}
          <div className={`${activeTab === 'chat' ? 'hidden lg:block' : ''}`}>
            {activeTab === 'edit' && generatedConfig ? (
              <ConfigEditor
                config={generatedConfig}
                onConfigChange={setGeneratedConfig}
              />
            ) : (
              <LivePreview
                config={generatedConfig}
                storefront={storefront}
                onEditClick={() => setActiveTab('edit')}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
