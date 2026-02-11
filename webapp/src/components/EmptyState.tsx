'use client';

import React from 'react';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = 'Shablonlar mavjud emas' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in-up">
      <div className="max-w-md text-center space-y-4">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-accent opacity-10 rounded-full animate-pulse" />
          <svg
            className="w-full h-full text-accent opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h3 className="font-mono font-bold text-xl sm:text-2xl">{message}</h3>
          <p className="text-secondary-text text-sm sm:text-base">
            Hozircha hech qanday shablon topilmadi. Iltimos, keyinroq qayta urinib ko'ring.
          </p>
        </div>

        {/* Decorative element */}
        <div className="flex justify-center gap-2 pt-4">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}
