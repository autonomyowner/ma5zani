'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLanguage } from '@/lib/LanguageContext';
import Input from './Input';

interface SlugInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function SlugInput({ value, onChange, disabled }: SlugInputProps) {
  const { language } = useLanguage();
  const [debouncedSlug, setDebouncedSlug] = useState(value);

  const availability = useQuery(
    api.storefronts.checkSlugAvailability,
    debouncedSlug.length >= 3 ? { slug: debouncedSlug } : 'skip'
  );

  // Debounce the slug check
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSlug(value);
    }, 500);
    return () => clearTimeout(timer);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Only allow lowercase letters, numbers, and hyphens
      const sanitized = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/--+/g, '-');
      onChange(sanitized);
    },
    [onChange]
  );

  const getStatusMessage = () => {
    if (value.length < 3) {
      return {
        text: language === 'ar' ? '3 أحرف على الأقل' : 'At least 3 characters',
        color: 'text-slate-400',
      };
    }

    if (!availability) {
      return {
        text: language === 'ar' ? 'جاري التحقق...' : 'Checking...',
        color: 'text-slate-400',
      };
    }

    if (availability.available) {
      return {
        text: language === 'ar' ? 'متاح' : 'Available',
        color: 'text-green-600',
      };
    }

    switch (availability.reason) {
      case 'taken':
        return {
          text: language === 'ar' ? 'هذا الرابط محجوز' : 'Already taken',
          color: 'text-red-600',
        };
      case 'reserved':
        return {
          text: language === 'ar' ? 'محجوز للنظام' : 'Reserved',
          color: 'text-red-600',
        };
      case 'invalid':
        return {
          text: language === 'ar' ? 'أحرف غير صالحة' : 'Invalid characters',
          color: 'text-red-600',
        };
      case 'length':
        return {
          text: language === 'ar' ? 'يجب أن يكون 3-30 حرف' : 'Must be 3-30 characters',
          color: 'text-red-600',
        };
      default:
        return {
          text: language === 'ar' ? 'غير متاح' : 'Not available',
          color: 'text-red-600',
        };
    }
  };

  const status = getStatusMessage();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-sm">ma5zani.com/</span>
        <Input
          value={value}
          onChange={handleChange}
          placeholder={language === 'ar' ? 'اسم-متجرك' : 'your-store'}
          disabled={disabled}
          className="flex-1"
          dir="ltr"
        />
      </div>
      <p className={`text-sm ${status.color}`}>{status.text}</p>
    </div>
  );
}
