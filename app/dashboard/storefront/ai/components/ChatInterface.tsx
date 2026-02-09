'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { localText } from '@/lib/translations';
import Button from '@/components/ui/Button';
import { GeneratedConfig } from '@/lib/storefront-ai';

interface ChatInterfaceProps {
  onGenerate: (prompt: string) => Promise<void>;
  isGenerating: boolean;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  generatedConfig: GeneratedConfig | null;
}

// Suggested prompts for quick start - aligned with distinctive design directions
const SUGGESTED_PROMPTS: Record<string, string[]> = {
  ar: [
    'متجر ملابس تقليدية جزائرية، أسلوب فاخر مع عنابي غامق #3d0c0c وذهبي #c4a035، خطوط Playfair Display',
    'متجر إلكترونيات، تصميم سايبربانك أسود نقي مع سماوي كهربائي #00ffff، أجواء مستقبلية',
    'متجر منتجات عضوية، أسلوب طبيعي مع أخضر غابة #1a3c1a وبرتقالي ترابي #c4683a',
    'بوتيك أزياء عصرية، تصميم تحريري جريء مع رمادي فحمي #1a1a1a وبرتقالي حاد #ff6b35',
    'متجر مستحضرات تجميل، أسلوب ناعم وأنيق مع وردي مغبر #d4a5a5 وشامبانيا #f5e6d3',
    'متجر مجوهرات فاخرة، خلفية داكنة راقية مع لمسات ذهبية',
  ],
  en: [
    'Traditional Algerian clothing, luxury dark style with burgundy #3d0c0c and antique gold #c4a035, Playfair Display fonts',
    'Electronics store, cyberpunk pure black with electric cyan #00ffff, futuristic edge',
    'Organic products, earthy organic style with forest green #1a3c1a and terracotta #c4683a',
    'Fashion boutique, bold editorial with charcoal #1a1a1a and sharp orange #ff6b35 accent',
    'Beauty cosmetics, soft luxury style with dusty rose #d4a5a5 and champagne #f5e6d3',
    'Luxury jewelry, dark refined background with elegant gold accents',
  ],
  fr: [
    'Boutique de vêtements traditionnels algériens, style luxueux avec bordeaux foncé #3d0c0c et or antique #c4a035, polices Playfair Display',
    'Boutique d\'électronique, cyberpunk noir pur avec cyan électrique #00ffff, ambiance futuriste',
    'Produits biologiques, style naturel avec vert forêt #1a3c1a et terre cuite #c4683a',
    'Boutique de mode, éditorial audacieux avec charbon #1a1a1a et orange vif #ff6b35',
    'Cosmétiques beauté, style doux et luxueux avec rose poudré #d4a5a5 et champagne #f5e6d3',
    'Bijouterie de luxe, fond sombre raffiné avec accents dorés élégants',
  ],
};

// Quick refinement prompts for iteration
const REFINEMENT_PROMPTS: Record<string, { label: string; prompt: string }[]> = {
  ar: [
    { label: 'أغمق', prompt: 'اجعل الألوان أغمق وأكثر دراماتيكية' },
    { label: 'أفتح', prompt: 'اجعل الألوان أفتح وأكثر هدوءاً' },
    { label: 'أجرأ', prompt: 'اجعل التباين أقوى والألوان أكثر جرأة' },
    { label: 'أبسط', prompt: 'اجعل التصميم أكثر بساطة مع مساحات بيضاء أكبر' },
    { label: '+ نشرة', prompt: 'أضف قسم النشرة البريدية' },
    { label: '+ عن المتجر', prompt: 'أضف قسم عن المتجر' },
  ],
  en: [
    { label: 'Darker', prompt: 'Make colors darker and more dramatic' },
    { label: 'Lighter', prompt: 'Make colors lighter and more calm' },
    { label: 'Bolder', prompt: 'Make contrast stronger and colors bolder' },
    { label: 'Simpler', prompt: 'Make design more minimal with more whitespace' },
    { label: '+ Newsletter', prompt: 'Add newsletter section' },
    { label: '+ About', prompt: 'Add about section' },
  ],
  fr: [
    { label: 'Plus sombre', prompt: 'Rendre les couleurs plus sombres et dramatiques' },
    { label: 'Plus clair', prompt: 'Rendre les couleurs plus claires et calmes' },
    { label: 'Plus audacieux', prompt: 'Renforcer le contraste et les couleurs' },
    { label: 'Plus simple', prompt: 'Rendre le design plus minimaliste avec plus d\'espace blanc' },
    { label: '+ Newsletter', prompt: 'Ajouter une section newsletter' },
    { label: '+ À propos', prompt: 'Ajouter une section à propos' },
  ],
};

export default function ChatInterface({
  onGenerate,
  isGenerating,
  conversationHistory,
  generatedConfig,
}: ChatInterfaceProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [prompt, setPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    const currentPrompt = prompt;
    setPrompt('');
    await onGenerate(currentPrompt);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isGenerating) return;
    await onGenerate(suggestion);
  };

  const suggestedPrompts = SUGGESTED_PROMPTS[language] || SUGGESTED_PROMPTS.en;

  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-[600px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200">
        <h2 className="font-semibold text-slate-900">
          {localText(language, { ar: 'تحدث مع المصمم', en: 'Chat with Designer', fr: 'Discuter avec le designer' })}
        </h2>
        <p className="text-sm text-slate-500">
          {localText(language, { ar: 'صِف متجرك والجو الذي تريده', en: 'Describe your store and the vibe you want', fr: 'Décrivez votre boutique et l\'ambiance souhaitée' })}
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationHistory.length === 0 ? (
          <div className="space-y-4">
            {/* Welcome Message */}
            <div className="text-center py-8">
              <div className="text-4xl mb-4">
                {'\u2728'}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {localText(language, { ar: 'مرحباً! أنا مصمم المتاجر الذكي', en: "Hi! I'm your AI store designer", fr: 'Bonjour ! Je suis votre designer IA' })}
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                {localText(language, { ar: 'صِف لي نوع متجرك والألوان والأجواء التي تريدها، وسأصمم لك متجراً فريداً', en: 'Tell me about your store, the colors and vibe you want, and I\'ll design a unique store for you', fr: 'Décrivez-moi votre boutique, les couleurs et l\'ambiance souhaitées, et je créerai un design unique pour vous' })}
              </p>
            </div>

            {/* Suggested Prompts */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">
                {localText(language, { ar: 'أفكار للبدء:', en: 'Ideas to get started:', fr: 'Idées pour commencer :' })}
              </p>
              <div className="grid gap-2">
                {suggestedPrompts.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isGenerating}
                    className="text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Conversation Messages */}
            {conversationHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-[#0054A6] text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Generated Config Summary */}
            {generatedConfig && !isGenerating && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">
                  {localText(language, { ar: 'التصميم جاهز!', en: 'Design Ready!', fr: 'Design prêt !' })}
                </h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>
                    <span className="font-medium">{localText(language, { ar: 'الاتجاه:', en: 'Direction:', fr: 'Direction :' })}</span>{' '}
                    {generatedConfig.aestheticDirection}
                  </p>
                  <p>
                    <span className="font-medium">{localText(language, { ar: 'الأقسام:', en: 'Sections:', fr: 'Sections :' })}</span>{' '}
                    {generatedConfig.sections.filter((s) => s.enabled).length}{' '}
                    {localText(language, { ar: 'قسم', en: 'sections', fr: 'sections' })}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-medium">{localText(language, { ar: 'الألوان:', en: 'Colors:', fr: 'Couleurs :' })}</span>
                    <div className="flex gap-1">
                      {Object.values(generatedConfig.colors).map((color, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded border border-slate-200"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-green-600 mt-3">
                  {localText(language, { ar: 'شاهد المعاينة ثم اضغط "تطبيق التصميم" لحفظه', en: 'Check the preview then click "Apply Design" to save', fr: 'Consultez l\'aperçu puis cliquez sur "Appliquer le design" pour sauvegarder' })}
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              localText(language, { ar: 'صِف متجرك... مثال: متجر أزياء عصرية بألوان زاهية', en: 'Describe your store... e.g., modern fashion store with vibrant colors', fr: 'Décrivez votre boutique... ex: boutique de mode moderne avec des couleurs vibrantes' })
            }
            disabled={isGenerating}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0054A6] focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          <Button type="submit" disabled={!prompt.trim() || isGenerating}>
            {isGenerating
              ? localText(language, { ar: 'جاري التصميم...', en: 'Designing...', fr: 'Conception en cours...' })
              : localText(language, { ar: 'إنشاء', en: 'Generate', fr: 'Générer' })}
          </Button>
        </form>

        {/* Quick refinement prompts when config exists */}
        {generatedConfig && !isGenerating && (
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-slate-500">
              {localText(language, { ar: 'تعديلات سريعة:', en: 'Quick tweaks:', fr: 'Ajustements rapides :' })}
            </span>
            {(REFINEMENT_PROMPTS[language] || REFINEMENT_PROMPTS.en).map((item, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(item.prompt)}
                className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
