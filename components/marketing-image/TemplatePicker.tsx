'use client';

import { useLanguage } from '@/lib/LanguageContext';
import { MARKETING_TEMPLATES } from './templates';

interface TemplatePickerProps {
  value: string;
  onChange: (templateId: string) => void;
}

export default function TemplatePicker({ value, onChange }: TemplatePickerProps) {
  const { language } = useLanguage();

  return (
    <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-2 -mx-1 px-1">
      {MARKETING_TEMPLATES.map((tmpl) => (
        <button
          key={tmpl.id}
          type="button"
          onClick={() => onChange(tmpl.id)}
          className={`flex-shrink-0 px-4 py-2.5 lg:px-5 lg:py-3 rounded-xl border-2 text-sm lg:text-base transition-all whitespace-nowrap ${
            value === tmpl.id
              ? 'border-[#0054A6] bg-[#0054A6]/5 text-[#0054A6] font-semibold'
              : 'border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          {tmpl.name[language]}
        </button>
      ))}
    </div>
  );
}
