'use client';

import { useMemo } from 'react';
import { wilayas } from '@/lib/wilayas';
import { communesByWilaya } from '@/lib/communes';
import { useLanguage } from '@/lib/LanguageContext';
import { localText } from '@/lib/translations';

interface CommuneSelectProps {
  wilayaName: string;
  value: string;
  onChange: (value: string) => void;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

export default function CommuneSelect({
  wilayaName,
  value,
  onChange,
  backgroundColor = '#ffffff',
  borderColor = 'rgba(0,0,0,0.15)',
  textColor = '#1a1a1a',
}: CommuneSelectProps) {
  const { language } = useLanguage();

  const communes = useMemo(() => {
    const wilaya = wilayas.find((w) => w.name === wilayaName);
    if (!wilaya) return [];
    return communesByWilaya[wilaya.code] || [];
  }, [wilayaName]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 text-sm transition-colors focus:outline-none appearance-none cursor-pointer"
      style={{
        backgroundColor,
        border: `1px solid ${borderColor}`,
        color: textColor,
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${textColor.replace('#', '%23')}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 0.75rem center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '1.5em 1.5em',
        paddingRight: '2.5rem',
      }}
      required
    >
      <option value="" style={{ backgroundColor, color: textColor }}>
        {localText(language, { ar: 'اختر البلدية', en: 'Select commune', fr: 'Choisir la commune' })}
      </option>
      {communes.map((commune) => (
        <option
          key={commune.name}
          value={commune.name}
          style={{ backgroundColor, color: textColor }}
        >
          {commune.name} ({commune.nameAr})
        </option>
      ))}
    </select>
  );
}
