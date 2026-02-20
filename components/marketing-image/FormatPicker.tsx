'use client';

import { useLanguage } from '@/lib/LanguageContext';

const FORMATS = [
  { id: 'square' as const, dimensions: '1080 x 1080' },
  { id: 'story' as const, dimensions: '1080 x 1920' },
  { id: 'facebook' as const, dimensions: '1200 x 628' },
];

interface FormatPickerProps {
  value: 'square' | 'story' | 'facebook';
  onChange: (format: 'square' | 'story' | 'facebook') => void;
}

export default function FormatPicker({ value, onChange }: FormatPickerProps) {
  const { t } = useLanguage();
  const mi = (t as unknown as Record<string, Record<string, string>>).marketingImages;

  const labels: Record<string, string> = {
    square: mi?.square || 'Square',
    story: mi?.story || 'Story',
    facebook: mi?.facebook || 'Facebook',
  };

  return (
    <div className="grid grid-cols-3 gap-2 lg:gap-3">
      {FORMATS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={`p-2 lg:p-3 rounded-xl border-2 text-center transition-all ${
            value === f.id
              ? 'border-[#0054A6] bg-[#0054A6]/5 text-[#0054A6] font-semibold'
              : 'border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          <span className="block text-sm lg:text-base font-medium">{labels[f.id]}</span>
          <span className="block text-xs text-slate-400 mt-0.5">{f.dimensions}</span>
        </button>
      ))}
    </div>
  );
}
