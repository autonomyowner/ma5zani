'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Doc } from '@/convex/_generated/dataModel';
import { GeneratedConfig, getGoogleFontsUrl } from '@/lib/storefront-ai';
import Button from '@/components/ui/Button';

// Helper to determine if a color is light (for text contrast)
function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  if (hex.length !== 6) return false;
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

interface LivePreviewProps {
  config: GeneratedConfig | null;
  storefront: Doc<'storefronts'>;
  onEditClick: () => void;
}

export default function LivePreview({ config, storefront, onEditClick }: LivePreviewProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  // Generate preview HTML for iframe
  const previewHtml = useMemo(() => {
    if (!config) return null;

    const fontsUrl = getGoogleFontsUrl(config.fonts);

    return `
<!DOCTYPE html>
<html lang="${language}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontsUrl}" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: '${config.fonts.body}', '${config.fonts.arabic}', sans-serif;
      background-color: ${config.colors.background};
      color: ${config.colors.text};
      min-height: 100vh;
      line-height: 1.6;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: '${config.fonts.display}', '${config.fonts.arabic}', serif;
      letter-spacing: -0.02em;
    }

    /* Header - Bold and distinctive */
    .header {
      background-color: ${config.colors.headerBg};
      padding: 20px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .header-logo {
      font-family: '${config.fonts.display}', '${config.fonts.arabic}', serif;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: ${isLightColor(config.colors.headerBg) ? config.colors.primary : '#ffffff'};
    }
    .header-nav {
      display: flex;
      gap: 24px;
      font-size: 14px;
      font-weight: 500;
      color: ${isLightColor(config.colors.headerBg) ? config.colors.text : 'rgba(255,255,255,0.85)'};
    }

    /* Sections - Generous spacing */
    .section {
      padding: 72px 32px;
    }
    .section-title {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 12px;
      text-align: center;
      letter-spacing: -0.03em;
    }
    .section-subtitle {
      font-size: 17px;
      opacity: 0.75;
      text-align: center;
      margin-bottom: 48px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Hero - Dramatic and impactful */
    .hero {
      padding: 100px 32px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(ellipse at 50% 0%, ${config.colors.accent}15 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-content {
      position: relative;
      z-index: 1;
    }
    .hero-title {
      font-size: 56px;
      font-weight: 800;
      margin-bottom: 20px;
      line-height: 1.1;
      letter-spacing: -0.04em;
    }
    .hero-subtitle {
      font-size: 19px;
      opacity: 0.85;
      margin-bottom: 40px;
      max-width: 520px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.7;
    }
    .hero-cta {
      display: inline-block;
      padding: 16px 40px;
      background-color: ${config.colors.accent};
      color: ${isLightColor(config.colors.accent) ? '#000000' : '#ffffff'};
      font-family: '${config.fonts.display}', '${config.fonts.arabic}', serif;
      font-weight: 700;
      font-size: 15px;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      border-radius: 4px;
      text-decoration: none;
      box-shadow: 0 4px 24px ${config.colors.accent}40;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .hero-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 32px ${config.colors.accent}50;
    }

    /* Features - Bold typography, no icons */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      max-width: 900px;
      margin: 0 auto;
    }
    .feature-card {
      text-align: center;
      padding: 32px 16px;
      border-radius: 8px;
      background: ${config.colors.background === '#ffffff' || config.colors.background === '#fefefe' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)'};
    }
    .feature-title {
      font-family: '${config.fonts.display}', '${config.fonts.arabic}', serif;
      font-size: 42px;
      font-weight: 800;
      color: ${config.colors.accent};
      margin-bottom: 8px;
      letter-spacing: -0.03em;
      line-height: 1;
    }
    .feature-desc {
      font-size: 13px;
      opacity: 0.7;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Products - Clean and elegant */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      max-width: 900px;
      margin: 0 auto;
    }
    .product-card {
      background: ${config.colors.background === '#ffffff' || config.colors.background === '#fefefe' ? '#ffffff' : 'rgba(255,255,255,0.08)'};
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }
    .product-image {
      aspect-ratio: 1;
      background: linear-gradient(145deg, ${config.colors.primary}15, ${config.colors.accent}10);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      color: ${config.colors.primary}60;
    }
    .product-info {
      padding: 16px;
    }
    .product-name {
      font-family: '${config.fonts.display}', '${config.fonts.arabic}', serif;
      font-weight: 600;
      margin-bottom: 6px;
      font-size: 15px;
      letter-spacing: -0.01em;
    }
    .product-price {
      color: ${config.colors.accent};
      font-weight: 700;
      font-size: 16px;
    }

    /* Announcement - Attention-grabbing */
    .announcement {
      background-color: ${config.colors.primary};
      color: ${isLightColor(config.colors.primary) ? '#000000' : '#ffffff'};
      padding: 14px 24px;
      text-align: center;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    /* About - Elegant and readable */
    .about {
      text-align: center;
      max-width: 650px;
      margin: 0 auto;
    }

    /* Newsletter - Clean form */
    .newsletter-form {
      max-width: 440px;
      margin: 0 auto;
      display: flex;
      gap: 12px;
    }
    .newsletter-input {
      flex: 1;
      padding: 14px 20px;
      border: 2px solid ${config.colors.primary}20;
      border-radius: 4px;
      font-size: 15px;
      background: ${config.colors.background};
      color: ${config.colors.text};
    }
    .newsletter-btn {
      padding: 14px 28px;
      background: ${config.colors.accent};
      color: ${isLightColor(config.colors.accent) ? '#000000' : '#ffffff'};
      border: none;
      border-radius: 4px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    /* Footer - Sophisticated */
    .footer {
      background-color: ${config.colors.footerBg};
      color: ${isLightColor(config.colors.footerBg) ? config.colors.text : '#ffffff'};
      padding: 48px 32px;
      text-align: center;
      margin-top: 0;
    }
    .footer-brand {
      font-family: '${config.fonts.display}', '${config.fonts.arabic}', serif;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    .footer-credit {
      opacity: 0.5;
      font-size: 12px;
    }
  </style>
</head>
<body>
  ${config.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order)
    .map((section) => renderSection(section, config, isRTL))
    .join('')}

  <div class="footer">
    <p class="footer-brand">${storefront.boutiqueName}</p>
    <p class="footer-credit">Powered by ma5zani</p>
  </div>
</body>
</html>
    `;
  }, [config, storefront, language, isRTL]);

  if (!config) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 h-[600px] flex items-center justify-center">
        <div className="text-center px-8">
          <div className="text-6xl mb-4 opacity-30">
            {'\uD83C\uDFA8'}
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {isRTL ? 'المعاينة ستظهر هنا' : 'Preview will appear here'}
          </h3>
          <p className="text-slate-500 max-w-sm">
            {isRTL
              ? 'استخدم المحادثة لوصف متجرك وسيظهر التصميم هنا'
              : 'Use the chat to describe your store and the design will appear here'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-[600px]">
      {/* Preview Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h2 className="font-semibold text-slate-900">
            {isRTL ? 'معاينة التصميم' : 'Design Preview'}
          </h2>
          <p className="text-xs text-slate-500">{config.aestheticDirection}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onEditClick}>
          {isRTL ? 'تعديل يدوي' : 'Manual Edit'}
        </Button>
      </div>

      {/* Config Summary Bar */}
      <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="text-slate-500">
            {isRTL ? 'الخط:' : 'Font:'} <span className="text-slate-700">{config.fonts.display}</span>
          </span>
          <span className="text-slate-500">
            {isRTL ? 'الأقسام:' : 'Sections:'}{' '}
            <span className="text-slate-700">{config.sections.filter((s) => s.enabled).length}</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          {Object.values(config.colors).slice(0, 4).map((color, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded border border-slate-200"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 overflow-hidden bg-slate-100">
        <div className="w-full h-full overflow-auto">
          <iframe
            srcDoc={previewHtml || ''}
            className="w-full h-full border-0"
            title="Storefront Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}

// Helper function to render a section as HTML
function renderSection(
  section: GeneratedConfig['sections'][0],
  config: GeneratedConfig,
  isRTL: boolean
): string {
  const title = isRTL ? section.content.titleAr || section.content.title : section.content.title;
  const subtitle = isRTL
    ? section.content.subtitleAr || section.content.subtitle
    : section.content.subtitle;
  const ctaText = isRTL ? section.content.ctaTextAr || section.content.ctaText : section.content.ctaText;
  const bgColor = section.content.backgroundColor || config.colors.background;
  const textColor = section.content.textColor || config.colors.text;

  switch (section.type) {
    case 'hero':
      return `
        <div class="hero" style="background-color: ${bgColor}; color: ${textColor};">
          <div class="hero-content">
            ${title ? `<h1 class="hero-title">${title}</h1>` : ''}
            ${subtitle ? `<p class="hero-subtitle">${subtitle}</p>` : ''}
            ${ctaText ? `<a href="#" class="hero-cta">${ctaText}</a>` : ''}
          </div>
        </div>
      `;

    case 'announcement':
      return `
        <div class="announcement">
          ${title || (isRTL ? 'شحن مجاني لجميع الولايات!' : 'Free shipping to all wilayas!')}
        </div>
      `;

    case 'features':
      const items = section.content.items || [];
      return `
        <div class="section" style="background-color: ${bgColor}; color: ${textColor};">
          ${title ? `<h2 class="section-title">${title}</h2>` : ''}
          <div class="features-grid">
            ${items
              .map(
                (item) => `
                <div class="feature-card">
                  <div class="feature-title">${isRTL ? item.titleAr || item.title : item.title}</div>
                  <div class="feature-desc">${isRTL ? item.descriptionAr || item.description : item.description}</div>
                </div>
              `
              )
              .join('')}
          </div>
        </div>
      `;

    case 'grid':
    case 'featured':
      const productsPerRow = section.content.productsPerRow || 3;
      return `
        <div class="section" style="background-color: ${bgColor}; color: ${textColor};">
          ${title ? `<h2 class="section-title">${title}</h2>` : ''}
          <div class="products-grid" style="grid-template-columns: repeat(${productsPerRow}, 1fr);">
            ${[1, 2, 3]
              .map(
                (i) => `
              <div class="product-card">
                <div class="product-image">${'\uD83D\uDCE6'}</div>
                <div class="product-info">
                  <div class="product-name">${isRTL ? `منتج ${i}` : `Product ${i}`}</div>
                  <div class="product-price">2,500 ${isRTL ? 'دج' : 'DZD'}</div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;

    case 'about':
      return `
        <div class="section" style="background-color: ${bgColor}; color: ${textColor};">
          <div class="about">
            ${title ? `<h2 class="section-title">${title}</h2>` : ''}
            ${subtitle ? `<p class="section-subtitle">${subtitle}</p>` : ''}
          </div>
        </div>
      `;

    case 'newsletter':
      return `
        <div class="section" style="background-color: ${bgColor}; color: ${textColor};">
          ${title ? `<h2 class="section-title">${title}</h2>` : ''}
          ${subtitle ? `<p class="section-subtitle">${subtitle}</p>` : ''}
          <div class="newsletter-form">
            <input type="email" placeholder="${isRTL ? 'بريدك الإلكتروني' : 'Your email'}" class="newsletter-input">
            <button class="newsletter-btn">${ctaText || (isRTL ? 'اشترك' : 'Subscribe')}</button>
          </div>
        </div>
      `;

    case 'categories':
      const catItems = section.content.items || [];
      return `
        <div class="section" style="background-color: ${bgColor}; color: ${textColor};">
          ${title ? `<h2 class="section-title">${title}</h2>` : ''}
          <div style="display: flex; justify-content: center; gap: 24px; flex-wrap: wrap;">
            ${catItems
              .map(
                (item) => `
                <div style="padding: 16px 32px; background: ${config.colors.primary}10; border-radius: 8px; font-weight: 600;">
                  ${isRTL ? item.titleAr || item.title : item.title}
                </div>
              `
              )
              .join('')}
          </div>
        </div>
      `;

    case 'collection':
      const collItems = section.content.items || [];
      return `
        <div class="section" style="background-color: ${bgColor}; color: ${textColor};">
          ${title ? `<h2 class="section-title">${title}</h2>` : ''}
          ${subtitle ? `<p class="section-subtitle">${subtitle}</p>` : ''}
          <div style="display: grid; grid-template-columns: repeat(${Math.min(collItems.length, 3)}, 1fr); gap: 24px; max-width: 800px; margin: 0 auto;">
            ${collItems
              .slice(0, 3)
              .map(
                (item) => `
                <div style="aspect-ratio: 1; background: linear-gradient(145deg, ${config.colors.primary}20, ${config.colors.accent}15); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-family: '${config.fonts.display}', serif; font-size: 20px; font-weight: 700;">
                  ${isRTL ? item.titleAr || item.title : item.title}
                </div>
              `
              )
              .join('')}
          </div>
        </div>
      `;

    default:
      return '';
  }
}
