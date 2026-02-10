'use client';

import React, { useEffect } from 'react';
import { useAppSelector } from '@/store';

interface GenerationModalProps {
  progress: number;
}

export default function GenerationModal({ progress }: GenerationModalProps) {
  const { uploadedImages } = useAppSelector((state) => state.generation);

  return (
    <div className="space-y-4 py-4">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 mx-auto">
          <svg className="animate-spin text-accent" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="font-mono text-base sm:text-lg font-bold">AI rasmlar yaratmoqda...</p>
          <p className="text-secondary-text text-xs">
            {progress < 40
              ? 'Rasmlar yuklanmoqda...'
              : progress < 90
              ? 'AI generatsiya qilmoqda...'
              : 'Yakunlanmoqda...'}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="w-full bg-secondary-bg rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-xs font-mono text-secondary-text">
          {progress}% - {progress < 100 ? 'Yuklanmoqda...' : 'Tayyor!'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {uploadedImages.map((img, index) => (
          <div key={index} className="relative">
            <div className="aspect-square rounded-lg overflow-hidden border border-border opacity-50">
              <img
                src={img.preview}
                alt={`Processing ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse bg-card bg-opacity-90 px-2 py-1 rounded-full">
                <p className="text-xs font-mono">Wait...</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
