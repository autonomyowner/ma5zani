'use client';

import { useState, useCallback } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { getR2PublicUrl } from '@/lib/r2';

interface ImageUploadProps {
  value?: string[];
  onChange: (keys: string[]) => void;
  maxImages?: number;
  folder?: string;
  id?: string;
}

export default function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  folder = 'products',
  id: instanceId,
}: ImageUploadProps) {
  const inputId = instanceId || 'image-upload';
  const { language } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      // Get presigned URL
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, key } = await response.json();

      // Upload to R2
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      return key;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remainingSlots = maxImages - value.length;
      if (remainingSlots <= 0) return;

      const filesToUpload = Array.from(files).slice(0, remainingSlots);
      setUploading(true);

      const newKeys: string[] = [];
      for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) continue;
        const key = await uploadFile(file);
        if (key) newKeys.push(key);
      }

      if (newKeys.length > 0) {
        onChange([...value, ...newKeys]);
      }

      setUploading(false);
    },
    [value, maxImages, onChange, folder]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleRemove = (index: number) => {
    const newKeys = value.filter((_, i) => i !== index);
    onChange(newKeys);
  };

  return (
    <div className="space-y-3">
      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {value.map((key, index) => (
            <div key={key} className="relative group aspect-square">
              <img
                src={getR2PublicUrl(key)}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border border-slate-200"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {value.length < maxImages && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            dragOver
              ? 'border-[#0054A6] bg-blue-50'
              : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            id={inputId}
            disabled={uploading}
          />
          <label
            htmlFor={inputId}
            className="cursor-pointer block"
          >
            {uploading ? (
              <div className="text-slate-500">
                {language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
              </div>
            ) : (
              <>
                <div className="text-slate-500 mb-1">
                  {language === 'ar'
                    ? 'اسحب الصور هنا أو انقر للاختيار'
                    : 'Drag images here or click to select'}
                </div>
                <div className="text-sm text-slate-400">
                  {language === 'ar'
                    ? `${value.length} من ${maxImages} صور`
                    : `${value.length} of ${maxImages} images`}
                </div>
              </>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
