'use client';

import React, { useEffect, useState } from 'react';
import { copyErrorToClipboard } from '@/utils/telegram';

interface AlertProps {
  message: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
  type?: 'success' | 'error';
  errorDetail?: string;
}

export default function Alert({ message, show, onClose, duration, type = 'success', errorDetail }: AlertProps) {
  const [visible, setVisible] = useState(show);
  const [copied, setCopied] = useState(false);

  const effectiveDuration = duration ?? (type === 'error' ? 6000 : 3000);

  useEffect(() => {
    setVisible(show);
    setCopied(false);
    if (show) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, effectiveDuration);
      return () => clearTimeout(timer);
    }
  }, [show, effectiveDuration, onClose]);

  if (!visible) return null;

  const handleCopy = async () => {
    const textToCopy = errorDetail || message;
    const success = await copyErrorToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isError = type === 'error';

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in max-w-sm">
      <div
        className={`px-4 py-3 rounded-lg shadow-2xl font-mono font-bold flex items-start space-x-3 ${
          isError
            ? 'bg-red-600 text-white'
            : 'bg-accent text-[#0a0a0a]'
        }`}
      >
        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          {isError ? (
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          ) : (
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          )}
        </svg>
        <div className="flex-1 min-w-0">
          <span className="text-sm break-words">{message}</span>
          {isError && errorDetail && (
            <button
              onClick={handleCopy}
              className="mt-2 flex items-center space-x-1 text-xs opacity-80 hover:opacity-100 transition-opacity bg-white/20 px-2 py-1 rounded"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{copied ? 'Nusxalandi!' : 'Nusxalash'}</span>
            </button>
          )}
        </div>
        <button
          onClick={() => { setVisible(false); onClose(); }}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
