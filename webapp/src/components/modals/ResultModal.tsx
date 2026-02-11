'use client';

import React, { useState } from 'react';
import api from '@/services/api';
import { downloadBlob } from '@/utils/helpers';
import { hapticFeedback } from '@/utils/telegram';

interface ResultModalProps {
  imageUrl: string;
  templateTitle: string;
  onClose: () => void;
}

export default function ResultModal({ imageUrl, templateTitle, onClose }: ResultModalProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const handleDownload = async () => {
    try {
      hapticFeedback('impact', 'medium');
      const blob = await api.downloadImage(imageUrl);
      const filename = `ai-generated-${templateTitle.toLowerCase().replace(/\s/g, '-')}.jpg`;
      downloadBlob(blob, filename);
      hapticFeedback('notification', 'success');
    } catch (error) {
      console.error('Download failed:', error);
      hapticFeedback('notification', 'error');
      alert('Yuklab olishda xatolik yuz berdi');
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-mono font-bold text-lg sm:text-xl mb-1">Rasm tayyor!</h3>
        <p className="text-secondary-text text-xs">AI rasm muvaffaqiyatli yaratildi</p>
      </div>

      <div className="animate-fade-in-up">
        <div className="rounded-lg overflow-hidden border-2 border-accent relative">
          {/* Skeleton loader */}
          {imageLoading && (
            <div className="absolute inset-0 bg-secondary-bg animate-pulse flex items-center justify-center">
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 mx-auto relative">
                  <div className="absolute inset-0 border-4 border-border rounded-full" />
                  <div className="absolute inset-0 border-4 border-accent rounded-full border-t-transparent animate-spin" />
                </div>
                <p className="text-secondary-text text-sm font-mono">Rasm yuklanmoqda...</p>
              </div>
            </div>
          )}
          {/* Actual image */}
          <img
            src={imageUrl}
            alt="Generated Image"
            className={`w-full h-auto object-contain transition-opacity duration-500 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleDownload}
          className="btn-secondary py-3 rounded-lg font-mono text-sm border-2 border-border hover:border-accent hover:bg-accent hover:text-[#0a0a0a] transition-all"
        >
          Yuklab olish
        </button>
        <button
          onClick={onClose}
          className="btn-primary py-3 rounded-lg font-mono font-bold text-sm bg-accent text-[#0a0a0a] hover:bg-transparent hover:text-accent border-2 border-accent transition-all"
        >
          Tayyor
        </button>
      </div>
    </div>
  );
}
