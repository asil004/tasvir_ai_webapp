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

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {uploadedImages.map((img, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden border border-border relative">
              {/* Image with overlay */}
              <img
                src={img.preview}
                alt={`Processing ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent to-transparent opacity-20 animate-shimmer" />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40" />
            </div>

            {/* Processing indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-card bg-opacity-95 px-3 py-1.5 rounded-full border border-accent shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <p className="text-xs font-mono text-accent">AI</p>
                </div>
              </div>
            </div>

            {/* Corner badge */}
            <div className="absolute top-2 right-2 bg-card bg-opacity-90 px-2 py-1 rounded-full border border-border">
              <p className="text-xs font-mono text-secondary-text">{index + 1}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
