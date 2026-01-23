'use client';

import { wilayas } from '@/lib/wilayas';

interface WilayaSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function WilayaSelect({ value, onChange }: WilayaSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0054A6] focus:border-transparent bg-white"
      required
    >
      <option value="">Select wilaya</option>
      {wilayas.map((wilaya) => (
        <option key={wilaya.code} value={wilaya.name}>
          {wilaya.code} - {wilaya.name} ({wilaya.nameAr})
        </option>
      ))}
    </select>
  );
}
