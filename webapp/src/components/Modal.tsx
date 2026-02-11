'use client';

import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />
      <div className="relative flex items-center justify-center min-h-screen p-4 py-8">
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 max-w-2xl w-full relative my-8 max-h-[90vh] overflow-y-auto animate-fade-in-up">
          <button
            onClick={onClose}
            className="sticky top-0 float-right z-10 w-8 h-8 flex items-center justify-center bg-secondary-bg hover:bg-accent hover:text-[#0a0a0a] rounded-full transition-all text-secondary-text"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="mt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
