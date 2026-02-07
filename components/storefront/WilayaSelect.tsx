'use client';

import { wilayas } from '@/lib/wilayas';
import { useLanguage } from '@/lib/LanguageContext';

interface WilayaSelectProps {
  value: string;
  onChange: (value: string) => void;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

export default function WilayaSelect({
  value,
  onChange,
  backgroundColor = '#ffffff',
  borderColor = 'rgba(0,0,0,0.15)',
  textColor = '#1a1a1a',
}: WilayaSelectProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

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
        {isRTL ? 'اختر الولاية' : 'Select wilaya'}
      </option>
      {wilayas.map((wilaya) => (
        <option
          key={wilaya.code}
          value={wilaya.name}
          style={{ backgroundColor, color: textColor }}
        >
          {wilaya.code} - {wilaya.name} ({wilaya.nameAr})
        </option>
      ))}
    </select>
  );
}
