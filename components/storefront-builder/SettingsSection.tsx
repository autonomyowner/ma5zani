'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/LanguageContext';
import Button from '@/components/ui/Button';

interface SettingsSectionProps {
  storefront: Doc<'storefronts'> | null;
}

export default function SettingsSection({ storefront }: SettingsSectionProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [autoFulfillment, setAutoFulfillment] = useState(
    storefront?.settings?.autoFulfillment || false
  );
  const [showOutOfStock, setShowOutOfStock] = useState(
    storefront?.settings?.showOutOfStock || false
  );
  const [saving, setSaving] = useState(false);

  const updateStorefront = useMutation(api.storefronts.updateStorefront);

  useEffect(() => {
    if (storefront?.settings) {
      setAutoFulfillment(storefront.settings.autoFulfillment);
      setShowOutOfStock(storefront.settings.showOutOfStock);
    }
  }, [storefront]);

  const handleSave = async () => {
    if (!storefront) return;

    setSaving(true);
    try {
      await updateStorefront({
        settings: { autoFulfillment, showOutOfStock },
      });
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!storefront) {
    return (
      <div className="text-center py-8 text-slate-500">
        {isRTL ? 'يرجى إنشاء متجرك أولاً' : 'Please create your storefront first'}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Auto Fulfillment */}
      <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
        <input
          type="checkbox"
          id="autoFulfillment"
          checked={autoFulfillment}
          onChange={(e) => setAutoFulfillment(e.target.checked)}
          className="mt-1 w-5 h-5 rounded border-slate-300 text-[#0054A6] focus:ring-[#0054A6]"
        />
        <label htmlFor="autoFulfillment" className="flex-1 cursor-pointer">
          <div className="font-medium text-slate-900">
            {isRTL ? 'التسليم التلقائي' : 'Auto Fulfillment'}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {isRTL
              ? 'إرسال الطلبات تلقائياً إلى مخزني للتوصيل عند استلامها.'
              : 'Automatically submit orders to ma5zani for fulfillment when received.'}
          </p>
        </label>
      </div>

      {/* Show Out of Stock */}
      <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
        <input
          type="checkbox"
          id="showOutOfStock"
          checked={showOutOfStock}
          onChange={(e) => setShowOutOfStock(e.target.checked)}
          className="mt-1 w-5 h-5 rounded border-slate-300 text-[#0054A6] focus:ring-[#0054A6]"
        />
        <label htmlFor="showOutOfStock" className="flex-1 cursor-pointer">
          <div className="font-medium text-slate-900">
            {isRTL ? 'عرض المنتجات النافدة' : 'Show Out of Stock Products'}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {isRTL
              ? 'عرض المنتجات غير المتوفرة في المتجر مع إشارة "نفد المخزون".'
              : 'Display out of stock products with an "Out of Stock" badge.'}
          </p>
        </label>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving}>
        {saving
          ? isRTL
            ? 'جاري الحفظ...'
            : 'Saving...'
          : isRTL
          ? 'حفظ الإعدادات'
          : 'Save Settings'}
      </Button>
    </div>
  );
}
