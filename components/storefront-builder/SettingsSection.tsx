'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/lib/LanguageContext';
import { localText } from '@/lib/translations';
import Button from '@/components/ui/Button';

interface SettingsSectionProps {
  storefront: Doc<'storefronts'> | null;
}

export default function SettingsSection({ storefront }: SettingsSectionProps) {
  const { language } = useLanguage();

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
        {localText(language, { ar: 'يرجى إنشاء متجرك أولاً', en: 'Please create your storefront first', fr: 'Veuillez d\'abord créer votre boutique' })}
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
            {localText(language, { ar: 'التسليم التلقائي', en: 'Auto Fulfillment', fr: 'Traitement automatique' })}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {localText(language, { ar: 'إرسال الطلبات تلقائياً إلى مخزني للتوصيل عند استلامها.', en: 'Automatically submit orders to ma5zani for fulfillment when received.', fr: 'Envoyer automatiquement les commandes à ma5zani pour le traitement à la réception.' })}
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
            {localText(language, { ar: 'عرض المنتجات النافدة', en: 'Show Out of Stock Products', fr: 'Afficher les produits en rupture de stock' })}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {localText(language, { ar: 'عرض المنتجات غير المتوفرة في المتجر مع إشارة "نفد المخزون".', en: 'Display out of stock products with an "Out of Stock" badge.', fr: 'Afficher les produits en rupture de stock avec un badge "Rupture de stock".' })}
          </p>
        </label>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving}>
        {saving
          ? localText(language, { ar: 'جاري الحفظ...', en: 'Saving...', fr: 'Enregistrement...' })
          : localText(language, { ar: 'حفظ الإعدادات', en: 'Save Settings', fr: 'Enregistrer les paramètres' })}
      </Button>
    </div>
  );
}
